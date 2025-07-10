import React, { useState, useEffect, useRef } from "react";
import { Alert, Button, Skeleton, message, Select, Badge, Card, Typography, Tabs } from "antd";
import { useLocation } from "react-router-dom";
import OpenAI from "openai";
import ChatPanel from "../components/ChatPanel";
import { useOutlineContext, FormData, ChatMessage } from "../contexts/OutlineContext";
import { 
  MDXEditor, 
  headingsPlugin, 
  listsPlugin, 
  quotePlugin, 
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  toolbarPlugin,
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

const { Title, Text } = Typography;
const { Option } = Select;

// Interface for episode data
interface EpisodeData {
  id: string;
  title: string;
  outline: string;
  chatHistory: ChatMessage[];
  script?: string;
  status: 'outline' | 'generating-script' | 'script-ready';
}

// Chat context types
type ChatContext = 'global' | 'episode';

const EpisodePage: React.FC = () => {
  const location = useLocation();
  const { outlineData } = useOutlineContext();
  
  // Get data from context or location state (for backward compatibility)
  const formData = outlineData.formData || (location.state?.formData as FormData);
  const outlineText = outlineData.outlineText || (location.state?.outlineText as string);
  
  // Episode management state
  const [episodes, setEpisodes] = useState<EpisodeData[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Chat context state
  const [chatContext, setChatContext] = useState<ChatContext>('global');
  const [globalChatHistory, setGlobalChatHistory] = useState<ChatMessage[]>([]);
  const [isChatProcessing, setIsChatProcessing] = useState(false);
  
  // Script panel state
  const [scriptPanelVisible, setScriptPanelVisible] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');
  
  // Editor state
  const [editorKey, setEditorKey] = useState(0);
  const editorRef = useRef<MDXEditorMethods>(null);
  
  // Layout state for chat/editor split
  const [chatHeight, setChatHeight] = useState(50); // 50% by default

  // Unified AI API calling function (reused from OutlinePage)
  const callAI = async (prompt: string, apiKey: string, provider: 'openai' | 'deepseek'): Promise<string> => {
    try {
      const apiConfig = provider === 'openai' 
        ? {
            baseURL: undefined,
            model: "gpt-4o"
          }
        : {
            baseURL: 'https://api.deepseek.com',
            model: "deepseek-chat"
          };

      const openai = new OpenAI({
        baseURL: apiConfig.baseURL,
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
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

  // Initialize episodes from outline
  const initializeEpisodes = async () => {
    if (!formData || !outlineText) return;

    setIsInitializing(true);
    
    try {
      const prompt = `Break down this script outline into detailed episodes. Each episode should have a clear title and detailed outline.

ORIGINAL OUTLINE:
${outlineText}

IMPORTANT: Return ONLY valid JSON in this exact format:

{
  "episodes": [
    {
      "title": "Episode 1: The Beginning", 
      "outline": "Detailed episode 1 outline with scenes, character development, and plot points..."
    },
    {
      "title": "Episode 2: The Conflict",
      "outline": "Detailed episode 2 outline..."
    }
  ]
}

CRITICAL RULES:
1. Return ONLY the JSON object, nothing else
2. Create 3-6 episodes based on the content complexity
3. Each episode outline should be COMPLETE FULL EPISODE OUTLINE in markdown format
4. Include detailed scene descriptions, character development, dialogue, and plot points
5. DO NOT provide brief summaries - provide actual complete episode content
6. Each outline should be production-ready and detailed
7. Use proper markdown formatting with headers and structure`;

      console.log(`🤖 Calling ${formData.aiProvider} to generate episodes...`);
      const aiResponse = await callAI(prompt, formData.apiKey, formData.aiProvider);
      
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[1]);
        } else {
          const jsonStart = aiResponse.indexOf('{');
          const jsonEnd = aiResponse.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = aiResponse.substring(jsonStart, jsonEnd + 1);
            parsedResponse = JSON.parse(jsonStr);
          } else {
            throw new Error('No valid JSON found');
          }
        }
      }

      if (parsedResponse.episodes && Array.isArray(parsedResponse.episodes)) {
        const newEpisodes: EpisodeData[] = parsedResponse.episodes.map((ep: any, index: number) => ({
          id: `episode-${index + 1}`,
          title: ep.title || `Episode ${index + 1}`,
          outline: ep.outline || '',
          chatHistory: [],
          status: 'outline' as const
        }));

        setEpisodes(newEpisodes);
        if (newEpisodes.length > 0) {
          setSelectedEpisodeId(newEpisodes[0].id);
        }

        setGlobalChatHistory([{
          id: `system-${Date.now()}`,
          type: 'system',
          content: `Episodes generated successfully! ${newEpisodes.length} episodes created. You can now edit individual episodes or make global changes.`,
          timestamp: new Date()
        }]);

        message.success(`${newEpisodes.length} episodes generated successfully!`);
      } else {
        throw new Error('Invalid response format');
      }

    } catch (error) {
      console.error('Episode initialization error:', error);
      message.error(`Failed to generate episodes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsInitializing(false);
    }
  };

  // Get current episode data
  const currentEpisode = episodes.find(ep => ep.id === selectedEpisodeId);

  // Handle chat messages with context awareness
  const handleChatMessage = async (userMessage: string) => {
    if (!formData?.apiKey || isChatProcessing) return;

    setIsChatProcessing(true);

    try {
      let chatPrompt = '';
      let currentChatHistory: ChatMessage[] = [];

      if (chatContext === 'global') {
        // Global context - can affect all episodes
        currentChatHistory = globalChatHistory;
        chatPrompt = `You are managing a multi-episode script project. Here is the context:

ORIGINAL OUTLINE: "${outlineText}"

ALL CURRENT EPISODES:
${episodes.map((ep, i) => `Episode ${i + 1}: ${ep.title}
${ep.outline}
---`).join('\n')}

CHAT HISTORY:
${currentChatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}

USER'S REQUEST: "${userMessage}"

IMPORTANT: Return ONLY valid JSON in this exact format:

{
  "chatReply": "Your conversational response to the user",
  "episodeUpdates": [
    {
      "id": "episode-1",
      "title": "Updated title or null if no change",
      "outline": "COMPLETE FULL EPISODE OUTLINE in markdown format, or null if no change"
    }
  ],
  "newEpisodes": [
    {
      "title": "New episode title",
      "outline": "COMPLETE FULL EPISODE OUTLINE in markdown format"
    }
  ],
  "deletedEpisodeIds": ["episode-id-to-delete"],
  "updateReason": "Brief explanation of changes made"
}

CRITICAL RULES:
1. For episodeUpdates: If an episode needs changes, provide the COMPLETE FULL episode outline, not just a summary of changes
2. Each episode outline should be detailed with scenes, character development, dialogue, and plot points
3. DO NOT provide brief descriptions - provide the actual complete episode content
4. Only include episodeUpdates for episodes that actually changed
5. Only include newEpisodes if new episodes should be added
6. Only include deletedEpisodeIds if episodes should be removed
7. Return empty arrays if no changes needed
8. When updating episodes due to deletions, ensure continuity and completeness`;

      } else {
        // Episode-specific context
        if (!currentEpisode) {
          message.error('No episode selected');
          return;
        }

        currentChatHistory = currentEpisode.chatHistory;
        const currentOutlineContent = editorRef.current?.getMarkdown() || currentEpisode.outline;

        chatPrompt = `You are helping to refine a specific episode. Here is the context:

FULL SERIES CONTEXT:
${episodes.map((ep, i) => `Episode ${i + 1}: ${ep.title}`).join('\n')}

CURRENT EPISODE: ${currentEpisode.title}
CURRENT OUTLINE:
${currentOutlineContent}

CHAT HISTORY:
${currentChatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}

USER'S REQUEST: "${userMessage}"

IMPORTANT: Return ONLY valid JSON in this exact format:

{
  "chatReply": "Your conversational response to the user",
  "outlineUpdate": "The complete updated outline text in markdown format, or null if no changes needed",
  "updateReason": "Brief explanation of what was changed"
}

CRITICAL RULES:
1. Return ONLY the JSON object, nothing else
2. For outlineUpdate: Provide the COMPLETE FULL episode outline, not just a summary of changes
3. Include detailed scenes, character development, dialogue, and plot points
4. DO NOT provide brief descriptions - provide the actual complete episode content
5. Maintain continuity with the overall series
6. Focus only on this specific episode`;
      }

      console.log(`🤖 Processing ${chatContext} chat message...`);
      const aiResponse = await callAI(chatPrompt, formData.apiKey, formData.aiProvider);
      
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        try {
          const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (jsonMatch) {
            parsedResponse = JSON.parse(jsonMatch[1]);
          } else {
            const jsonStart = aiResponse.indexOf('{');
            const jsonEnd = aiResponse.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonStr = aiResponse.substring(jsonStart, jsonEnd + 1);
              parsedResponse = JSON.parse(jsonStr);
            } else {
              throw new Error('No JSON found');
            }
          }
        } catch {
          parsedResponse = {
            chatReply: aiResponse,
            outlineUpdate: null,
            updateReason: "AI response was not in expected JSON format"
          };
        }
      }

      // Add user message to appropriate chat history
      const userChatMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      };

      // Add AI response to appropriate chat history
      const aiChatMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: parsedResponse.chatReply || "I've processed your request.",
        timestamp: new Date()
      };

      if (chatContext === 'global') {
        setGlobalChatHistory(prev => [...prev, userChatMessage, aiChatMessage]);
        
        // Handle global updates
        if (parsedResponse.episodeUpdates && parsedResponse.episodeUpdates.length > 0) {
          setEpisodes(prev => prev.map(ep => {
            const update = parsedResponse.episodeUpdates.find((u: any) => u.id === ep.id);
            if (update) {
              return {
                ...ep,
                title: update.title || ep.title,
                outline: update.outline || ep.outline
              };
            }
            return ep;
          }));
          setEditorKey(prev => prev + 1);
          message.success("Episodes updated successfully!");
        }

        // Handle new episodes
        if (parsedResponse.newEpisodes && parsedResponse.newEpisodes.length > 0) {
          const newEpisodes: EpisodeData[] = parsedResponse.newEpisodes.map((ep: any, index: number) => ({
            id: `episode-${episodes.length + index + 1}`,
            title: ep.title,
            outline: ep.outline,
            chatHistory: [],
            status: 'outline' as const
          }));
          setEpisodes(prev => [...prev, ...newEpisodes]);
          message.success(`${newEpisodes.length} new episodes added!`);
        }

        // Handle deleted episodes
        if (parsedResponse.deletedEpisodeIds && parsedResponse.deletedEpisodeIds.length > 0) {
          setEpisodes(prev => prev.filter(ep => !parsedResponse.deletedEpisodeIds.includes(ep.id)));
          message.success("Episodes removed successfully!");
        }

      } else {
        // Update episode-specific chat history
        setEpisodes(prev => prev.map(ep => {
          if (ep.id === selectedEpisodeId) {
            return {
              ...ep,
              chatHistory: [...ep.chatHistory, userChatMessage, aiChatMessage],
              outline: parsedResponse.outlineUpdate || ep.outline
            };
          }
          return ep;
        }));

        if (parsedResponse.outlineUpdate) {
          setEditorKey(prev => prev + 1);
          message.success("Episode outline updated successfully!");
        }
      }

    } catch (error) {
      console.error('Chat AI Error:', error);
      
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      
      if (chatContext === 'global') {
        setGlobalChatHistory(prev => [...prev, errorMessage]);
      } else if (currentEpisode) {
        setEpisodes(prev => prev.map(ep => {
          if (ep.id === selectedEpisodeId) {
            return {
              ...ep,
              chatHistory: [...ep.chatHistory, errorMessage]
            };
          }
          return ep;
        }));
      }
      
      message.error('Failed to process chat message');
    } finally {
      setIsChatProcessing(false);
    }
  };

  // Generate script for specific episode
  const generateScript = async (episodeId: string) => {
    const episode = episodes.find(ep => ep.id === episodeId);
    if (!episode || !formData?.apiKey) return;

    // Update episode status to generating
    setEpisodes(prev => prev.map(ep => 
      ep.id === episodeId ? { ...ep, status: 'generating-script' as const } : ep
    ));

    try {
      const prompt = `Generate a complete, professional script for this episode based on the outline.

EPISODE TITLE: ${episode.title}
EPISODE OUTLINE:
${episode.outline}

FULL SERIES CONTEXT:
${episodes.map((ep, i) => `Episode ${i + 1}: ${ep.title}`).join('\n')}

Please create a full script with:
1. Proper scene headings
2. Character dialogue
3. Action lines
4. Stage directions
5. Professional formatting
6. Please be complete and professional, for every scenary, describe them in paragraphs when possible, like a book, output around 5000 words in Chinese.

Return the complete script in markdown format.`;

      console.log(`🎬 Generating script for ${episode.title}...`);
      const scriptContent = await callAI(prompt, formData.apiKey, formData.aiProvider);

      // Update episode with generated script
      setEpisodes(prev => prev.map(ep => 
        ep.id === episodeId ? { 
          ...ep, 
          script: scriptContent,
          status: 'script-ready' as const 
        } : ep
      ));

      setScriptPanelVisible(true);
      setSelectedScriptId(episodeId);
      message.success(`Script generated for ${episode.title}!`);

    } catch (error) {
      console.error('Script generation error:', error);
      message.error(`Failed to generate script: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset episode status
      setEpisodes(prev => prev.map(ep => 
        ep.id === episodeId ? { ...ep, status: 'outline' as const } : ep
      ));
    }
  };

  // Initialize episodes when component mounts
  useEffect(() => {
    if (formData && outlineText) {
      initializeEpisodes();
    }
  }, [formData, outlineText]); // initializeEpisodes is defined inline and only depends on these props

  // Handle case where user navigates directly without outline data
  if (!formData || !outlineText) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="Missing Outline Data"
          description="Please complete the outline creation process first before managing episodes."
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => window.location.href = '/outline'}>
              Go to Outline Page
            </Button>
          }
        />
      </div>
    );
  }

  // Get current chat history based on context
  const currentChatHistory = chatContext === 'global' 
    ? globalChatHistory 
    : (currentEpisode?.chatHistory || []);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header Alert */}
      <div style={{ 
        padding: '20px 32px', 
        flexShrink: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Alert
          message={isInitializing ? "🎬 Creating Episodes..." : "📺 Episode Manager"}
          description={
            isInitializing 
              ? `Breaking down your outline into manageable episodes...`
              : `${episodes.length} episodes ready • Use global chat for series changes, episode chat for specific edits`
          }
          type={isInitializing ? "info" : "success"}
          showIcon
          style={{
            borderRadius: '12px',
            border: 'none',
            background: isInitializing 
              ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
              : 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
        />
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        minHeight: 0,
        gap: '2px',
        background: 'rgba(0, 0, 0, 0.06)',
        padding: '4px' // Minimal padding for maximum space
      }}>
        {isInitializing ? (
          // Initial loading state
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            margin: '4px',
            borderRadius: '12px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: 64, 
                marginBottom: 20,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>🎬</div>
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          </div>
        ) : (
          // Two/Three-panel layout
          <>
            {/* Left Panel - Chat + Episode Navigator */}
            <div style={{ 
              width: '30%', 
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px 0 0 12px',
              margin: '4px 0 4px 4px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              {/* Chat Context Selector */}
              <div style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px 0 0 0',
                color: 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <Title level={5} style={{ color: 'white', margin: 0, marginBottom: 4 }}>
                      {chatContext === 'global' ? '🌍 Global Series Chat' : `📝 ${currentEpisode?.title || 'Episode Chat'}`}
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                      {chatContext === 'global' ? 'Manage all episodes' : 'Edit current episode'}
                    </Text>
                  </div>
                  <Select
                    value={chatContext}
                    onChange={setChatContext}
                    style={{ width: 140 }}
                    size="small"
                  >
                    <Option value="global">🌍 Global</Option>
                    <Option value="episode">📝 Episode</Option>
                  </Select>
                </div>
              </div>

              {/* Chat Panel */}
              <div style={{ 
                height: `${chatHeight}%`, 
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                position: 'relative'
              }}>
                <ChatPanel
                  chatHistory={currentChatHistory}
                  isProcessing={isChatProcessing}
                  onSendMessage={handleChatMessage}
                  disabled={!formData.apiKey}
                />
                
                {/* Height adjustment controls */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 8,
                  display: 'flex',
                  gap: 4,
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px 8px 0 0',
                  padding: '4px 8px',
                  fontSize: 12
                }}>
                  <Button 
                    size="small" 
                    type="text" 
                    style={{ padding: '0 4px', height: 20, fontSize: 10 }}
                    onClick={() => setChatHeight(30)}
                    title="Minimize chat"
                  >
                    ↓
                  </Button>
                  <Button 
                    size="small" 
                    type="text" 
                    style={{ padding: '0 4px', height: 20, fontSize: 10 }}
                    onClick={() => setChatHeight(50)}
                    title="Balance view"
                  >
                    ▣
                  </Button>
                  <Button 
                    size="small" 
                    type="text" 
                    style={{ padding: '0 4px', height: 20, fontSize: 10 }}
                    onClick={() => setChatHeight(70)}
                    title="Maximize chat"
                  >
                    ↑
                  </Button>
                </div>
              </div>

              {/* Episode Navigator */}
              <div style={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0
              }}>
                <div style={{ 
                  padding: '12px 16px', 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white'
                }}>
                  <Title level={5} style={{ color: 'white', margin: 0, marginBottom: 4 }}>
                    Episodes
                  </Title>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                    {episodes.length} total • {episodes.filter(ep => ep.script).length} scripts ready
                  </Text>
                </div>
                
                <div style={{ 
                  flex: 1, 
                  padding: '8px', 
                  overflow: 'auto'
                }}>
                  {/* Grid layout for episodes */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '8px'
                  }}>
                    {episodes.map((episode, index) => (
                      <Card 
                        key={episode.id}
                        size="small"
                        hoverable
                        style={{ 
                          cursor: 'pointer',
                          border: selectedEpisodeId === episode.id ? '2px solid #667eea' : '1px solid #e5e7eb',
                          borderRadius: '8px',
                          background: selectedEpisodeId === episode.id ? '#f0f4ff' : 'white',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setSelectedEpisodeId(episode.id)}
                        bodyStyle={{ padding: '8px' }}
                      >
                        {/* Episode title - truncated */}
                        <div style={{ marginBottom: 6 }}>
                          <Text 
                            strong 
                            style={{ 
                              fontSize: 11, 
                              display: 'block',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                            title={episode.title}
                          >
                            {episode.title}
                          </Text>
                        </div>
                        
                        {/* Status badge */}
                        <div style={{ marginBottom: 6 }}>
                          <Badge 
                            status={episode.status === 'script-ready' ? 'success' : episode.status === 'generating-script' ? 'processing' : 'default'}
                            text={
                              <Text style={{ fontSize: 9, color: '#666' }}>
                                {episode.status === 'script-ready' ? 'Ready' : 
                                 episode.status === 'generating-script' ? 'Loading...' : 'Outline'}
                              </Text>
                            }
                          />
                        </div>
                        
                        {/* Generate script button */}
                        <Button 
                          size="small"
                          type={episode.script ? "default" : "primary"}
                          block
                          style={{ 
                            fontSize: 9,
                            height: 20,
                            borderRadius: '4px',
                            padding: '0 4px'
                          }}
                          loading={episode.status === 'generating-script'}
                          onClick={(e) => {
                            e.stopPropagation();
                            generateScript(episode.id);
                          }}
                        >
                          {episode.script ? 'Regen' : 'Script'}
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Panel - Episode Editor Only */}
            <div style={{ 
              flex: scriptPanelVisible ? 1 : 1, 
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: scriptPanelVisible ? '0' : '0 12px 12px 0',
              margin: scriptPanelVisible ? '4px 0' : '4px 4px 4px 0',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.3s ease'
            }}>
              {/* Editor Header */}
              <div style={{ 
                padding: '16px 20px', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: scriptPanelVisible ? '0' : '0 12px 0 0',
                color: 'white'
              }}>
                <Title level={5} style={{ color: 'white', margin: 0, marginBottom: 4 }}>
                  {currentEpisode ? `📝 ${currentEpisode.title}` : '📺 Episode Editor'}
                </Title>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                  {currentEpisode ? 'Edit episode outline and content' : 'Select an episode to start editing'}
                </Text>
              </div>

              {/* Episode Editor - Full Height */}
              <div style={{ 
                flex: 1, 
                padding: 16, 
                overflow: 'auto',
                background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {currentEpisode ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    flex: 1,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                  }}>
                    <div style={{
                      flex: 1,
                      overflow: 'auto',
                      wordWrap: 'break-word',
                      wordBreak: 'break-word',
                      minHeight: 0
                    }}>
                      <MDXEditor
                        ref={editorRef}
                        key={`episode-editor-${selectedEpisodeId}-${editorKey}`}
                        markdown={currentEpisode.outline}
                        onChange={(value: string) => {
                          setEpisodes(prev => prev.map(ep => 
                            ep.id === selectedEpisodeId ? { ...ep, outline: value } : ep
                          ));
                        }}
                        suppressHtmlProcessing={true}
                        contentEditableClassName="prose"
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
                            css: 'CSS',
                            markdown: 'Markdown',
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
                    </div>
                    </div>
                ) : (
                  <div style={{ 
                    border: '2px dashed #e5e7eb', 
                    padding: 48, 
                    textAlign: 'center', 
                    color: '#6b7280',
                    borderRadius: 16,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    flexDirection: 'column'
                  }}>
                    <div style={{ 
                      fontSize: 48, 
                      marginBottom: 16,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>📺</div>
                    <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>Select an Episode</div>
                    <div style={{ fontSize: 14, color: '#9ca3af' }}>Choose an episode from the left panel to start editing</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Script Manager (conditionally visible) */}
            {scriptPanelVisible && (
              <div style={{ 
                width: '30%', 
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '0 12px 12px 0',
                margin: '4px 4px 4px 0',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  padding: '16px 20px', 
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '0 12px 0 0',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <Title level={4} style={{ color: 'white', margin: 0, marginBottom: 4 }}>
                      Scripts
                    </Title>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 12 }}>
                      Generated scripts
                    </Text>
                  </div>
                  <Button 
                    size="small" 
                    type="text" 
                    style={{ color: 'white' }}
                    onClick={() => setScriptPanelVisible(false)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Tabs
                    type="card"
                    size="small"
                    activeKey={selectedScriptId}
                    onChange={setSelectedScriptId}
                    style={{ height: '100%' }}
                    items={episodes
                      .filter(ep => ep.script)
                      .map(ep => ({
                        key: ep.id,
                        label: ep.title.split(':')[0],
                        children: (
                          <div style={{ 
                            padding: 16, 
                            height: 'calc(100vh - 250px)', 
                            overflow: 'auto',
                            background: '#f8fafc'
                          }}>
                            <div style={{
                              background: 'white',
                              padding: 20,
                              borderRadius: 8,
                              fontFamily: 'Monaco, "Courier New", monospace',
                              fontSize: 12,
                              lineHeight: 1.6,
                              whiteSpace: 'pre-wrap',
                              border: '1px solid #e5e7eb'
                            }}>
                              {ep.script}
                            </div>
                            
                            <div style={{ 
                              marginTop: 16, 
                              display: 'flex', 
                              gap: 8, 
                              justifyContent: 'flex-end' 
                            }}>
                              <Button 
                                size="small"
                                onClick={() => {
                                  navigator.clipboard.writeText(ep.script || '');
                                  message.success('Script copied to clipboard!');
                                }}
                              >
                                📋 Copy
                              </Button>
                            </div>
                          </div>
                        )
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EpisodePage; 