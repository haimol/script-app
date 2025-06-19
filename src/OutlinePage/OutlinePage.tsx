import React, { useState, useEffect } from "react";
import { Alert, Button, Spin, message } from "antd";
import { useLocation, Navigate } from "react-router-dom";
import OpenAI from "openai";
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
  InsertCodeBlock
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
      message.success(`Outline generated successfully using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)}!`);

    } catch (error) {
      console.error('AI Generation Error:', error);
      message.error(`Failed to generate outline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate outline content from form data
  useEffect(() => {
    if (formData) {
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
    <div style={{ padding: 24 }}>
      <Alert
        message={isGenerating ? "Generating AI Outline..." : "AI Outline Ready!"}
        description={
          isGenerating 
            ? `Using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} to generate your script outline...`
            : `Generated using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} at ${new Date(formData.processedAt).toLocaleString()}`
        }
        type={isGenerating ? "info" : "success"}
        showIcon
        style={{ marginBottom: 16 }}
        action={
          !isGenerating && (
            <Button 
              size="small" 
              type="primary" 
              onClick={generateAIOutline}
              disabled={!formData.apiKey}
            >
              Regenerate
            </Button>
          )
        }
      />
      
      <Spin spinning={isGenerating} tip="Generating AI outline...">
        <div style={{ minHeight: '500px' }}>
          {outlineText.length > 0 ? (
            <MDXEditor
              key="mdx-editor-stable"
              markdown={outlineText}
              onChange={(value: string) => setOutlineText(value)}
              readOnly={isGenerating}
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
                      <UndoRedo />
                      <Separator />
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
              borderRadius: 4
            }}>
              No content to display
            </div>
          )}
          

        </div>
      </Spin>
      
                {/* Additional controls */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button 
          onClick={generateAIOutline}
          loading={isGenerating}
          disabled={!formData.apiKey}
          type="default"
        >
          {isGenerating ? 'Generating...' : 'Regenerate Outline'}
        </Button>
        <Button 
          onClick={() => setOutlineText('')}
          disabled={isGenerating}
        >
          Clear
        </Button>
        <Button 
          onClick={() => {
            navigator.clipboard.writeText(outlineText);
            message.success('Content copied to clipboard!');
          }}
          disabled={!outlineText}
          type="default"
        >
          Copy Content
        </Button>
      </div>
      

    </div>
  );
};

export default OutlinePage; 