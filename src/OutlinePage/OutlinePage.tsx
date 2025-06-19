import React, { useState, useEffect, useRef } from "react";
import { Alert, Button, Spin, Skeleton, message, Divider } from "antd";
import { useLocation, Navigate } from "react-router-dom";
import OpenAI from "openai";
import ChatPanel, { ChatMessage } from "../components/ChatPanel";
import { 
  MDXEditor, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  ListsToggle,
  Separator,
  diffSourcePlugin,
  InsertThematicBreak,
  CodeToggle,
  InsertCodeBlock,
  MDXEditorMethods
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

// Interface for the form data structure
interface FormData {
  aiProvider: 'deepseek' | 'openai';
  apiKey: string;
  appDescription: string;
  processedAt: string;
}

const OutlinePage: React.FC = () => {
  const location = useLocation();
  const formData = location.state?.formData as FormData;
  const [outlineText, setOutlineText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [initialGenerationComplete, setInitialGenerationComplete] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const editorRef = useRef<MDXEditorMethods>(null);

  // Unified AI API calling function
  const callAI = async (prompt: string, apiKey: string, provider: 'openai' | 'deepseek'): Promise<string> => {
    try {
      // Configure API settings based on provider
      const apiConfig = provider === 'openai' 
        ? {
            baseURL: undefined, // Use default OpenAI URL
            model: "gpt-4o"
          }
        : {
            baseURL: 'https://api.deepseek.com',
            model: "deepseek-chat"
          };

      const openai = new OpenAI({
        baseURL: apiConfig.baseURL,
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
      });

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a professional script writer and creative assistant." },
          { role: "user", content: prompt }
        ],
        model: apiConfig.model,
        max_tokens: 2000,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "No response generated.";
    } catch (error) {
      console.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API Error:`, error);
      throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Main function to generate outline using AI
  const generateAIOutline = async () => {
    if (!formData) {
      message.error('Form data is missing');
      return;
    }

    // Require API key for AI generation
    if (!formData.apiKey) {
      message.error('API key is required to generate AI outline');
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);

    try {
      // Create prompt based on user's description
//       const prompt = `Create a detailed script outline for the following project:

// Description: ${formData.appDescription}

// Please provide a comprehensive script outline with the following structure:
// 1. Title and logline
// 2. Character descriptions
// 3. Scene-by-scene breakdown
// 4. Key dialogue points
// 5. Visual elements and staging notes

// Make it professional and ready for production use.`;

//for testing
const prompt = `${formData.appDescription}`;

      // Call AI service with the selected provider
      console.log(`🤖 Calling ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} API...`);
      const aiResponse = await callAI(prompt, formData.apiKey, formData.aiProvider);

      // Set the AI-generated content
      setOutlineText(aiResponse);
      // Force editor to refresh by changing key
      setEditorKey(prev => prev + 1);
      setInitialGenerationComplete(true);
      
      // Add initial system message to chat history
      setChatHistory([{
        id: `system-${Date.now()}`,
        type: 'system',
        content: `Initial outline generated successfully! You can now chat to refine it.`,
        timestamp: new Date()
      }]);
      
      message.success(`Outline generated successfully using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)}!`);

    } catch (error) {
      console.error('AI Generation Error:', error);
      message.error(`Failed to generate outline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Chat message handler
  const handleChatMessage = async (userMessage: string) => {
    if (!formData?.apiKey || isChatProcessing) return;

    // Get the current content from the editor (real-time version)
    const currentOutlineContent = editorRef.current?.getMarkdown() || outlineText;
    console.log('Current outline content from editor:', currentOutlineContent);

    // Add user message to chat history
    const userChatMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    
    setChatHistory(prev => [...prev, userChatMessage]);
    setIsChatProcessing(true);

    try {
      // Create enhanced prompt with context using current editor content
      const chatPrompt = `You are helping to refine a script outline. Here is the context:

ORIGINAL REQUEST: "${formData.appDescription}"

CURRENT OUTLINE:
${currentOutlineContent}

CHAT HISTORY:
${chatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}

USER'S NEW REQUEST: "${userMessage}"

IMPORTANT: You MUST respond with ONLY valid JSON in this exact format (no extra text, no markdown formatting):

{
  "chatReply": "Your conversational response to the user, if user looks like he wants to make a change to the outline even though the
  user did not explict mentioned the outline, you should ask the user to double confirm",
  "outlineUpdate": "The complete updated outline text in markdown format, or null if no changes needed",
  "updateReason": "Brief explanation of what was changed or why no changes were made"
}

Rules:
1. Return ONLY the JSON object, nothing else
2. If updating the outline, provide the COMPLETE updated outline, not just changes
3. Use null (not "null") for outlineUpdate if no changes are needed
4. Keep the outline in markdown format with proper headers and structure`;

      console.log(`🤖 Processing chat message with ${formData.aiProvider}...`);
      const aiResponse = await callAI(chatPrompt, formData.apiKey, formData.aiProvider);
      
      console.log('Raw AI Response:', aiResponse);
      
      // Try to extract JSON from response (AI might wrap it in code blocks or text)
      let parsedResponse;
      try {
        // Try direct parsing first
        parsedResponse = JSON.parse(aiResponse);
      } catch (parseError) {
        try {
          // Try to extract JSON from code blocks
          const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[1]);
          } else {
            // Try to find JSON-like content
            const jsonStart = aiResponse.indexOf('{');
            const jsonEnd = aiResponse.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonStr = aiResponse.substring(jsonStart, jsonEnd + 1);
              parsedResponse = JSON.parse(jsonStr);
            } else {
              throw new Error('No JSON found in response');
            }
          }
        } catch (secondParseError) {
          console.warn('Failed to parse JSON response:', aiResponse);
          // Fallback - treat entire response as chat reply, no outline update
          parsedResponse = {
            chatReply: aiResponse,
            outlineUpdate: null,
            updateReason: "AI response was not in expected JSON format"
          };
        }
      }

      console.log('Parsed Response:', parsedResponse);

      // Validate parsed response structure
      if (!parsedResponse || typeof parsedResponse !== 'object') {
        parsedResponse = {
          chatReply: "I processed your request but couldn't format the response properly.",
          outlineUpdate: null,
          updateReason: "Invalid response format"
        };
      }

      // Add AI response to chat history
      const aiChatMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: parsedResponse.chatReply || "I've processed your request.",
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, aiChatMessage]);

      // Update outline if AI provided changes
      if (parsedResponse.outlineUpdate && 
          parsedResponse.outlineUpdate !== null && 
          typeof parsedResponse.outlineUpdate === 'string' && 
          parsedResponse.outlineUpdate.trim()) {
        
        console.log('Updating outline with:', parsedResponse.outlineUpdate);
        setOutlineText(parsedResponse.outlineUpdate);
        // Force editor to refresh by changing key
        setEditorKey(prev => prev + 1);
        message.success("Outline updated successfully!");
      } else {
        console.log('No outline update needed:', parsedResponse.updateReason);
      }

    } catch (error) {
      console.error('Chat AI Error:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
      message.error('Failed to process chat message');
    } finally {
      setIsChatProcessing(false);
    }
  };

  // Generate outline content from form data
  useEffect(() => {
    if (formData && !initialGenerationComplete) {
      // Auto-generate AI outline when form data is available
      generateAIOutline();
    }
  }, [formData]);

  // Handle case where user navigates directly to outline without form data
  if (!formData) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="No Form Data Found"
          description="Please fill out the form first to generate an outline."
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => window.history.back()}>
              Go Back to Form
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Alert */}
      <div style={{ padding: '16px 24px', flexShrink: 0 }}>
        <Alert
          message={isGenerating ? "Generating AI Outline..." : initialGenerationComplete ? "AI Outline Ready!" : "Preparing..."}
          description={
            isGenerating 
              ? `Using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} to generate your script outline...`
              : initialGenerationComplete
                ? `Generated using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} • Chat to refine your outline`
                : "Setting up your workspace..."
          }
          type={isGenerating ? "info" : initialGenerationComplete ? "success" : "info"}
          showIcon
          action={
            initialGenerationComplete && !isGenerating && (
              <Button 
                size="small" 
                type="default" 
                onClick={generateAIOutline}
                disabled={!formData.apiKey}
              >
                Regenerate
              </Button>
            )
          }
        />
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {!initialGenerationComplete ? (
          // Initial loading state - show layout preview
          <>
            {/* Left Panel - Chat Preview (Disabled) */}
            <div style={{ 
              width: '40%', 
              borderRight: '1px solid #e8e8e8',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              background: '#fafafa'
            }}>
              <div style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid #e8e8e8',
                background: 'white'
              }}>
                <Skeleton.Input active size="default" style={{ width: '70%', marginBottom: 8 }} />
                <Skeleton.Input active size="small" style={{ width: '90%' }} />
              </div>
              
              <div style={{ 
                flex: 1, 
                padding: '16px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', color: '#ccc' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                  <div style={{ fontSize: 14 }}>Chat will be available<br />after outline generation</div>
                </div>
              </div>
              
              <div style={{ 
                padding: '16px 20px', 
                background: 'white',
                borderTop: '1px solid #e8e8e8'
              }}>
                                 <Skeleton.Input active style={{ width: '100%' }} />
              </div>
            </div>

            {/* Right Panel - Outline Loading */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: 0
            }}>
              <div style={{ flex: 1, padding: 16 }}>
                <div style={{ 
                  border: '1px solid #d9d9d9', 
                  borderRadius: 6, 
                  padding: 16,
                  height: '100%',
                  overflow: 'auto'
                }}>
                  {/* Simulate script outline structure with skeleton */}
                  <Skeleton.Input active size="large" style={{ width: '60%', marginBottom: 24 }} />
                  <Skeleton active paragraph={{ rows: 2 }} />
                  
                  <Skeleton.Input active size="default" style={{ width: '40%', marginTop: 16, marginBottom: 12 }} />
                  <Skeleton active paragraph={{ rows: 3 }} />
                  
                  <Skeleton.Input active size="default" style={{ width: '50%', marginTop: 16, marginBottom: 12 }} />
                  <Skeleton active paragraph={{ rows: 4 }} />
                  
                  <Skeleton.Input active size="default" style={{ width: '45%', marginTop: 16, marginBottom: 12 }} />
                  <Skeleton active paragraph={{ rows: 2 }} />
                  
                  <Skeleton.Input active size="default" style={{ width: '55%', marginTop: 16, marginBottom: 12 }} />
                  <Skeleton active paragraph={{ rows: 3 }} />
                </div>
              </div>

              {/* Bottom Controls Preview */}
              <div style={{ 
                padding: '8px 16px', 
                borderTop: '1px solid #e8e8e8',
                background: '#fafafa',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Skeleton.Button active size="small" style={{ width: 60 }} />
                  <Skeleton.Button active size="small" style={{ width: 60 }} />
                  <div style={{ marginLeft: 'auto' }}>
                    <Skeleton.Input active size="small" style={{ width: 80 }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Two-panel layout after initial generation
          <>
            {/* Left Panel - Chat */}
            <div style={{ 
              width: '40%', 
              borderRight: '1px solid #e8e8e8',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <ChatPanel
                chatHistory={chatHistory}
                isProcessing={isChatProcessing}
                onSendMessage={handleChatMessage}
                disabled={!formData.apiKey}
              />
            </div>

            {/* Right Panel - Outline Editor */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: 0
            }}>
              {/* Outline Editor */}
              <div style={{ flex: 1, padding: 16, overflow: 'auto' }}>
                {outlineText.length > 0 ? (
                  <MDXEditor
                    ref={editorRef}
                    key={`mdx-editor-${editorKey}`}
                    markdown={outlineText}
                    onChange={(value: string) => setOutlineText(value)}
                    suppressHtmlProcessing={true}
                    plugins={[
                      headingsPlugin(),
                      listsPlugin(),
                      quotePlugin(),
                      thematicBreakPlugin(),
                      markdownShortcutPlugin(),
                      linkPlugin(),
                      tablePlugin(),
                      codeBlockPlugin({
                        defaultCodeBlockLanguage: ''
                      }),
                      codeMirrorPlugin({
                        codeBlockLanguages: {
                          js: 'JavaScript',
                          ts: 'TypeScript',
                          jsx: 'JavaScript (React)',
                          tsx: 'TypeScript (React)',
                          html: 'HTML',
                          css: 'CSS',
                          json: 'JSON',
                          markdown: 'Markdown',
                          bash: 'Bash',
                          python: 'Python',
                          '': 'Plain Text'
                        }
                      }),
                      diffSourcePlugin({
                        viewMode: 'rich-text',
                        diffMarkdown: ''
                      }),
                      toolbarPlugin({
                        toolbarContents: () => (
                          <>
                            {/* <UndoRedo /> */}
                            {/* <Separator /> */}
                            <BoldItalicUnderlineToggles />
                            <CodeToggle />
                            <Separator />
                            <BlockTypeSelect />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <CreateLink />
                            <InsertTable />
                            <Separator />
                            <InsertCodeBlock />
                            <InsertThematicBreak />
                          </>
                        )
                      })
                    ]}
                  />
                ) : (
                  <div style={{ 
                    border: '1px dashed #ccc', 
                    padding: 20, 
                    textAlign: 'center', 
                    color: '#666',
                    borderRadius: 4,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    No content to display
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div style={{ 
                padding: '8px 16px', 
                borderTop: '1px solid #e8e8e8',
                background: '#fafafa',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12 }}>
                  <Button 
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(outlineText);
                      message.success('Content copied to clipboard!');
                    }}
                    disabled={!outlineText}
                    type="default"
                  >
                    📋 Copy
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => setOutlineText('')}
                    disabled={isGenerating || isChatProcessing}
                  >
                    🗑️ Clear
                  </Button>
                  <div style={{ 
                    fontSize: 11, 
                    color: '#999', 
                    alignSelf: 'center',
                    marginLeft: 'auto'
                  }}>
                    {outlineText.length} characters
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OutlinePage; 