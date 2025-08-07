import React, { useState, useEffect, useRef } from "react";
import { Alert, Button, Skeleton, message, Select, Badge, Card, Typography, Tabs } from "antd";
import { useLocation } from "react-router-dom";
import OpenAI from "openai";
import ChatPanel from "../components/ChatPanel";
import { useOutlineContext, FormData, ChatMessage, parseProjectData, ProjectData } from "../contexts/OutlineContext";
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
  const episodeCount = location.state?.episodeCount as number || 4;
  
  // Parse project data to get narrative style
  const projectData = formData ? parseProjectData(formData.projectDataJson) : null;
  
  // Narrative style mapping (same as OutlinePage)
  const narrativeStyleMap = {
    'linear': '直叙',
    'flashback': '倒叙', 
    'intercut': '插叙'
  };
  
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
            model: "deepseek-reasoner"
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
        max_tokens: 64000,
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
      const prompt = `你是一位专业剧本创作者，擅长基于结构逻辑、人物动机与主题构建完整且富有戏剧张力的影视剧本。
请根据以下资料，将剧本大纲分解为 ${episodeCount} 个详细的剧集：

**故事梗概：** ${projectData?.storySynopsis || 'No synopsis provided'}

**结构大纲与剧情大纲：** ${outlineText}

**叙述方式：** ${projectData?.narrativeStyle ? narrativeStyleMap[projectData.narrativeStyle] : '直叙'}

**剧集分配规则：**
- 第1集：起 - 故事开端，人物介绍，背景设定
- 第2集：承 - 激励事件 + 承段发展
- 第3集：转 - 转折事件 + 转段冲突升级  
- 第4集：合 - 危机事件 + 合段高潮与结局

**创作指导：**
请结合结构大纲的七个要素（身份、欲望、动作、问题、阻障、结果、意义）和剧情大纲表格结构（人物、原因、动作、内容、反应）来创作每个剧集。确保：

1. **人物动机清晰**：每个角色的参与动机、背景立场要明确
2. **行动策略合理**：角色采取的行动策略要符合其身份和动机
3. **行为展开具体**：具体行为要详细描述（如潜入、破坏、争辩、劝说等）
4. **反应后果明确**：每个行为都要有相应的剧情后果、人物冲突或观众情绪反馈
5. **冲突逐步升级**：确保情节逻辑连贯，冲突在剧集间逐步升级

{
  "episodes": [
    {
      "title": "第1集：{剧集标题}", 
      "outline": "每个场次需注明场景类型、场景名称与时间，并简要描述场景氛围、环境要素及时代背景。接着列出出场人物，标明角色身份与性格特征。对白与动作部分需包含角色名称、情绪或动作、对白内容及相关动作描述。两个场次之间请用明确分隔（如“---”或标识“场次一”、“场次二”）。整体内容需体现每位角色在语言或动作上的个性表达与情绪变化。"
    },
    {
      "title": "第2集：{剧集标题}",
      "outline": "每个场次需注明场景类型、场景名称与时间，并简要描述场景氛围、环境要素及时代背景。接着列出出场人物，标明角色身份与性格特征。对白与动作部分需包含角色名称、情绪或动作、对白内容及相关动作描述。两个场次之间请用明确分隔（如“---”或标识“场次一”、“场次二”）。整体内容需体现每位角色在语言或动作上的个性表达与情绪变化。"
    }
  ]
}

**重要规则：**
1. 仅返回 JSON 对象，不要其他内容
2. 严格按照要求创建 ${episodeCount} 个剧集
3. 每个剧集大纲必须是完整的完整剧集大纲，使用 markdown 格式
4. 包含详细的场景描述、角色发展、对话和情节要点
5. 不要提供简要摘要 - 提供实际的完整剧集内容
6. 每个大纲应该是制作就绪且详细的
7. 使用适当的 markdown 格式和标题结构
8. 在所有剧集中遵循指定的叙述方式 (${projectData?.narrativeStyle ? narrativeStyleMap[projectData.narrativeStyle] : '直叙'})
9. 每个剧集必须反映结构要素（身份、欲望、动作、问题、阻障、结果、意义）
10. 角色动机和行动必须与剧情大纲表格结构（人物、原因、动作、内容、反应）保持一致
11. 确保冲突和角色发展在剧集间的逻辑推进`;

      console.log(`🤖 Calling ${formData.aiProvider} to generate episodes...`);
      console.log(prompt);
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
        chatPrompt = `你正在管理一个多集剧本项目。以下是相关背景信息：



**故事梗概：** ${projectData?.storySynopsis || 'No synopsis provided'}

**结构大纲与剧情大纲：** ${outlineText}

叙述方式：${projectData?.narrativeStyle ? narrativeStyleMap[projectData.narrativeStyle] : '直叙'} (${projectData?.narrativeStyle || 'linear'})

所有当前剧集：
${episodes.map((ep, i) => `第${i + 1}集：${ep.title}
${ep.outline}
---`).join('\n')}

聊天历史：
${currentChatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}

用户请求：${userMessage}

重要：请仅返回以下格式的有效JSON：

{
  "chatReply": "你对用户的对话回复",
  "episodeUpdates": [
    {
      "id": "episode-1",
      "title": "更新的标题，如无变化则为null",
      "outline": "完整的剧集大纲（markdown格式），如无变化则为null"
    }
  ],
  "newEpisodes": [
    {
      "title": "新剧集标题",
      "outline": "完整的剧集大纲（markdown格式）"
    }
  ],
  "deletedEpisodeIds": ["要删除的剧集id"],
  "updateReason": "修改原因的简要说明"
}

关键规则：
1. 对于episodeUpdates：如果剧集需要修改，请提供完整的剧集大纲，而不是仅提供修改摘要
2. 每个剧集大纲应包含详细的场景、角色发展、对话和情节要点
3. 不要提供简要描述 - 要提供实际的完整剧集内容
4. 仅包含实际发生变化的剧集的episodeUpdates
5. 仅在有新剧集需要添加时包含newEpisodes
6. 仅在需要删除剧集时包含deletedEpisodeIds
7. 如无需更改则返回空数组
8. 因删除而更新剧集时，确保连续性和完整性`;

      } else {
        // Episode-specific context
        if (!currentEpisode) {
          message.error('No episode selected');
          return;
        }

        currentChatHistory = currentEpisode.chatHistory;
        const currentOutlineContent = editorRef.current?.getMarkdown() || currentEpisode.outline;

        chatPrompt = `你正在协助完善一个特定剧集。以下是相关背景信息：

**故事梗概：** ${projectData?.storySynopsis || '未提供故事梗概'}

**结构大纲与剧情大纲：** ${outlineText}

完整系列背景：
${episodes.map((ep, i) => `第${i + 1}集：${ep.title}`).join('\n')}

叙述方式：${projectData?.narrativeStyle ? narrativeStyleMap[projectData.narrativeStyle] : '直叙'} (${projectData?.narrativeStyle || 'linear'})

当前剧集：${currentEpisode.title}
当前大纲：
${currentOutlineContent}

聊天历史：
${currentChatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}

用户请求："${userMessage}"

重要：请仅返回以下格式的有效JSON：

{
  "chatReply": "你对用户的对话回复",
  "outlineUpdate": "完整的更新后大纲文本（markdown格式），如无变化则为null",
  "updateReason": "修改原因的简要说明"
}

关键规则：
1. 仅返回JSON对象，不要其他内容
2. 对于outlineUpdate：提供完整的完整剧集大纲，而不是仅提供修改摘要
3. 包含详细的场景、角色发展、对话和情节要点
4. 不要提供简要描述 - 提供实际的完整剧集内容
5. 保持与整体系列的连续性
6. 仅专注于这个特定剧集
7. 遵循指定的叙述方式 (${projectData?.narrativeStyle ? narrativeStyleMap[projectData.narrativeStyle] : '直叙'}) 用于所有内容`;
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
      const prompt = `基于以下大纲为这一集生成完整、专业的剧本。

**故事梗概：** ${projectData?.storySynopsis || '未提供故事梗概'}

**结构大纲与剧情大纲：** ${outlineText}

剧集标题：${episode.title}

剧集大纲：
${episode.outline}

完整系列背景：
${episodes.map((ep, i) => `第${i + 1}集：${ep.title}`).join('\n')}

叙述方式：${projectData?.narrativeStyle ? narrativeStyleMap[projectData.narrativeStyle] : '直叙'} (${projectData?.narrativeStyle || 'linear'})

请创建一个完整的剧本，包含：
1. 适当的场景标题
2. 角色对话
3. 动作描述
4. 舞台指示
5. 专业格式
6. 请完整且专业地对每个场景进行段落式描述，尽量避免空格等无意义字符，像书籍一样
7. 请输出约5000中文字符的内容
8. 在整个剧本中遵循指定的叙述方式 (${projectData?.narrativeStyle ? narrativeStyleMap[projectData.narrativeStyle] : '直叙'})。

请以纯文本格式返回完整剧本。`;

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
  }, [formData, outlineText, episodeCount]); // initializeEpisodes is defined inline and depends on these props

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