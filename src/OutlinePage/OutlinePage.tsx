import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Skeleton, message, InputNumber, Tooltip } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import OpenAI from "openai";
import ChatPanel from "../components/ChatPanel";
import { useOutlineContext, FormData, ChatMessage, parseProjectData } from "../contexts/OutlineContext";
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

const OutlinePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use context for persistent data
  const {
    outlineData,
    setFormData,
    setOutlineText,
    setChatHistory,
    setInitialGenerationComplete,
    setIsGenerating,
    setIsChatProcessing
  } = useOutlineContext();

  // Extract data from context
  const {
    formData,
    outlineText,
    chatHistory,
    initialGenerationComplete,
    isGenerating,
    isChatProcessing
  } = outlineData;

  // Local state for editor key to force refresh
  const [editorKey, setEditorKey] = useState(0);
  const [episodeCount, setEpisodeCount] = useState(4);
  const editorRef = useRef<MDXEditorMethods>(null);

  // If navigating with new form data, update context
  const locationFormData = location.state?.formData as FormData | undefined;
  useEffect(() => {
    if (locationFormData && (!formData || locationFormData.processedAt !== formData.processedAt)) {
      setFormData(locationFormData);
    }
  }, [locationFormData, formData, setFormData]);

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
            model: "deepseek-reasoner"
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
        max_tokens: 64000,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "未生成响应。";
    } catch (error) {
      console.error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API Error:`, error);
      throw new Error(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  // Main function to generate outline using AI
  const generateAIOutline = async () => {
    if (!formData) {
      message.error('表单数据缺失');
      return;
    }

    // Require API key for AI generation
    if (!formData.apiKey) {
      message.error('需要API密钥才能生成AI大纲');
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);

    try {
      // Parse the structured project data
      const projectData = parseProjectData(formData.projectDataJson);
      
      if (!projectData) {
        throw new Error('项目数据格式无效');
      }

      // Create comprehensive prompt using PO's design with JSON data integration
      const narrativeStyleMap = {
        'linear': '直叙',
        'flashback': '倒叙', 
        'intercut': '插叙'
      };

      const prompt = `请你担任剧本结构顾问，协助我根据以下资料生成剧本的幕与梗概。

**剧本要求：** ${projectData.scriptRequirement}
**陈述方式：** ${narrativeStyleMap[projectData.narrativeStyle]}

我已经填写完成以下内容：

**人物确立表：**包含主要角色的身份、欲望、动作等要素。
${projectData.characters.map((char, i) => `
人物 ${i + 1}:
• 身份: ${char.identity}
• 欲望: ${char.desire}
• 动作: ${char.action}
• 设计思路: ${char.designConcept || '待补充'}
`).join('')}

**事件确立表：**列出核心问题、主要障碍、结果等要素。
${projectData.events.map((event, i) => `
事件 ${i + 1}:
• 核心问题: ${event.coreProblem}
• 主要障碍: ${event.mainObstacle}
• 结果: ${event.result}
• 设计思路: ${event.designConcept || '待补充'}
`).join('')}

**主题确立表：**明确本剧的主题思想、正价值、负价值。
${projectData.themes.map((theme, i) => `
主题 ${i + 1}:
• 正价值: ${theme.positiveValue}
• 负价值: ${theme.negativeValue}
• 设计思路: ${theme.designConcept || '待补充'}
`).join('')}

**故事要素表：**统整故事三支柱（人物、事件、主题）与故事八要素（身份、欲望、动作、核心问题、主要障碍、结果、正价值、负价值）。

**故事梗概：**描述主线剧情、核心冲突与人物关系的文本。
${projectData.storySynopsis}

**任务目标：**
请你根据以上内容，采用${narrativeStyleMap[projectData.narrativeStyle]}的陈述方式，输出两份剧本结构图表，分别是「结构大纲」与「剧情大纲」，并遵循以下结构说明：

**第一张表：结构大纲**
这是一个二维矩阵表格：

横轴表示剧情的发展阶段，依序为：
起 → 激励事件 → 承 → 转折事件 → 转 → 危机事件 → 合

纵轴表示剧作构成要素，依序为：
身份、欲望、动作、问题、阻障、结果、意义

请你在每一个「阶段 × 要素」的交叉位置，填写1～2句话，说明：
• 此阶段角色的状态（例如身份变化）
• 当前的欲望或动机
• 所采取的关键行动
• 正在面对的核心问题
• 遭遇的外在阻碍
• 阶段性的事件结果
• 与主题相关的意义或思辨内容

**第二张表：剧情大纲**
这是一张多行表格，每一行是一个角色在高潮阶段的行为与反应。表格结构为：

列字段（横轴）依序为：
人物、原因（角色为何出现此行动）、动作（具体行动）、内容（行动描述）、反应（他人或观众的回应）

请至少列出5个主要角色在高潮事件中的行为与冲突反应，参考的高潮内容可基于"危机事件"或"合"发展得出。

每一列应当明确角色意图、所作行为、戏剧张力与反应结果（如情绪转变、观众激昂、角色顿悟等）。

**注意事项**
• 所有输出必须结构清楚、语义一致；
• 结构大纲必须展现出角色弧线、冲突升级与主题深化；
• 如果任何输入资料缺失，请以合理方式补足，保持故事连贯性；
• 请不要输出完整剧本，仅输出结构表格内容，内容需要详尽并遵守故事要素表和故事梗概。`;

      // Log the complete prompt for debugging
      console.log('📝 COMPLETE AI PROMPT:');
      console.log('='.repeat(80));
      console.log(prompt);
      console.log('='.repeat(80));
      console.log('📊 STRUCTURED DATA:');
      console.log('Project Data:', projectData);
      console.log('Form Data JSON:', formData.projectDataJson);

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
      message.error(`生成大纲失败: ${error instanceof Error ? error.message : '未知错误'}`);
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
    
    setChatHistory((prev: ChatMessage[]) => [...prev, userChatMessage]);
    setIsChatProcessing(true);

    try {
      // Parse the structured project data for context
      const projectData = parseProjectData(formData.projectDataJson);
      
      if (!projectData) {
        throw new Error('项目数据格式无效');
      }

      // Create enhanced prompt with context using current editor content and structured data
      const chatPrompt = `你正在帮助优化剧本大纲。以下是相关背景信息：

原始项目数据:
故事梗概: "${projectData.storySynopsis}"

人物要素:
${projectData.characters.map((char, i) => `人物 ${i + 1}: ${char.identity} (欲望: ${char.desire}, 动作: ${char.action})`).join('\n')}

事件要素:
${projectData.events.map((event, i) => `事件 ${i + 1}: ${event.coreProblem} → ${event.result}`).join('\n')}

主题思想:
${projectData.themes.map((theme, i) => `主题 ${i + 1}: ${theme.positiveValue} vs ${theme.negativeValue}`).join('\n')}

当前大纲内容:
${currentOutlineContent}

聊天历史:
${chatHistory.map(msg => `${msg.type}: ${msg.content}`).join('\n')}

用户的新请求: "${userMessage}"

重要说明: 你必须仅以下面的JSON格式回复（不要添加任何额外文本，不要使用markdown格式）：

{
  "chatReply": "你对用户的对话回复，如果用户看起来想要修改大纲（即使用户没有明确提到大纲），你也应该始终更新大纲",
  "outlineUpdate": "完整更新后的大纲文本（markdown格式），如果不需要修改则为null",
  "updateReason": "简要说明修改了什么或为什么不需要修改"
}

关键规则:
1. 仅返回JSON对象，不要有其他内容
2. 对于outlineUpdate: 提供完整的大纲内容，不是修改摘要
3. 包含详细的场景、角色发展、对话和情节要点
4. 不要提供简要描述 - 要提供实际完整的大纲内容
5. 保持专业的剧本格式和结构
6. 如果不需要修改，使用null（不是"null"）
7. 保持大纲为markdown格式，使用适当的标题和结构
8. 确保与原始项目要素（人物、事件、主题）保持一致`;

      // Log the complete chat prompt for debugging
      console.log('💬 COMPLETE CHAT PROMPT:');
      console.log('='.repeat(80));
      console.log(chatPrompt);
      console.log('='.repeat(80));

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
              throw new Error('响应中未找到JSON');
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
          chatReply: "我已处理您的请求，但无法正确格式化响应。",
          outlineUpdate: null,
                      updateReason: "响应格式无效"
        };
      }

      // Add AI response to chat history
      const aiChatMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: parsedResponse.chatReply || "I've processed your request.",
        timestamp: new Date()
      };
      
      setChatHistory((prev: ChatMessage[]) => [...prev, aiChatMessage]);

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
        content: `抱歉，我遇到了一个错误: ${error instanceof Error ? error.message : '未知错误'}`,
        timestamp: new Date()
      };
      
      setChatHistory((prev: ChatMessage[]) => [...prev, errorMessage]);
      message.error('处理聊天消息失败');
    } finally {
      setIsChatProcessing(false);
    }
  };

  // Function to proceed to episode management
  const proceedToEpisodes = () => {
    if (!outlineText.trim()) {
      message.error('请先创建大纲，然后再前往剧集管理');
      return;
    }

    // Get the current content from the editor (real-time version)
    const currentOutlineContent = editorRef.current?.getMarkdown() || outlineText;
    
    navigate('/episodes', { 
      state: { 
        formData: formData,
        outlineText: currentOutlineContent,
        episodeCount: episodeCount
      } 
    });
  };

  // Generate outline content from form data
  useEffect(() => {
    if (formData && !initialGenerationComplete) {
      // Auto-generate AI outline when form data is available
      generateAIOutline();
    }
  }, [formData, initialGenerationComplete]);

  // Handle case where user navigates directly to outline without form data
  if (!formData) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="未找到表单数据"
          description="请先填写表单以生成大纲。"
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => navigate('/')}>
              前往首页
            </Button>
          }
        />
      </div>
    );
  }

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
          message={isGenerating ? "🤖 正在生成AI大纲..." : initialGenerationComplete ? "✨ AI大纲已就绪！" : "⚡ 准备中..."}
          description={
            isGenerating 
              ? `正在使用 ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} AI 制作您的剧本大纲...`
              : initialGenerationComplete
                ? `由 ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} AI 生成 • 开始聊天以完善您的大纲`
                : "正在设置您的创意工作空间..."
          }
          type={isGenerating ? "info" : initialGenerationComplete ? "success" : "info"}
          showIcon
          style={{
            borderRadius: '12px',
            border: 'none',
            background: isGenerating 
              ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
              : initialGenerationComplete 
                ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
                : 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          action={
            initialGenerationComplete && !isGenerating && (
              <Button 
                size="small" 
                type="primary"
                onClick={generateAIOutline}
                disabled={!formData.apiKey}
                style={{
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(102, 126, 234, 0.3)',
                  fontWeight: 500
                }}
              >
                🔄 重新生成
              </Button>
            )
          }
        />
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        minHeight: 0,
        gap: '1px',
        background: 'rgba(0, 0, 0, 0.06)'
      }}>
        {!initialGenerationComplete ? (
          // Initial loading state - show layout preview
          <>
            {/* Left Panel - Chat Preview (Disabled) */}
            <div style={{ 
              width: '40%', 
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px 0 0 16px',
              margin: '16px 0 16px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                padding: '24px 28px', 
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px 0 0 0',
                color: 'white'
              }}>
                <Skeleton.Input active size="default" style={{ width: '70%', marginBottom: 8 }} />
                <Skeleton.Input active size="small" style={{ width: '90%' }} />
              </div>
              
              <div style={{ 
                flex: 1, 
                padding: '32px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ 
                    fontSize: 64, 
                    marginBottom: 20,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>💬</div>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 500,
                    color: '#6b7280',
                    lineHeight: 1.6
                  }}>
                    交互式聊天<br />
                    <span style={{ fontSize: 14, color: '#9ca3af' }}>大纲生成后可用</span>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                padding: '20px 28px', 
                background: 'rgba(248, 250, 252, 0.8)',
                borderRadius: '0 0 0 16px',
                borderTop: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <Skeleton.Input active style={{ width: '100%', borderRadius: '12px' }} />
              </div>
            </div>

            {/* Right Panel - Outline Loading */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              minHeight: 0,
              maxHeight: '100%',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0 16px 16px 0',
              margin: '16px 16px 16px 0',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                flex: 1, 
                padding: 24, 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ 
                  border: '2px dashed #e5e7eb', 
                  borderRadius: 16, 
                  padding: 24,
                  flex: 1,
                  overflow: 'auto',
                  background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)',
                  maxHeight: '100%'
                }}>
                  {/* Simulate script outline structure with skeleton */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <Skeleton.Input active size="large" style={{ width: '60%', borderRadius: '8px' }} />
                    <Skeleton active paragraph={{ rows: 2 }} />
                    
                    <Skeleton.Input active size="default" style={{ width: '40%', borderRadius: '6px' }} />
                    <Skeleton active paragraph={{ rows: 2 }} />
                    
                    <Skeleton.Input active size="default" style={{ width: '50%', borderRadius: '6px' }} />
                    <Skeleton active paragraph={{ rows: 2 }} />
                    
                    <Skeleton.Input active size="default" style={{ width: '45%', borderRadius: '6px' }} />
                    <Skeleton active paragraph={{ rows: 2 }} />
                    
                    <Skeleton.Input active size="default" style={{ width: '55%', borderRadius: '6px' }} />
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </div>
                </div>
              </div>

              {/* Bottom Controls Preview */}
              <div style={{ 
                padding: '16px 24px', 
                background: 'rgba(248, 250, 252, 0.8)',
                borderRadius: '0 0 16px 0',
                flexShrink: 0,
                borderTop: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Skeleton.Button active size="small" style={{ width: 80, borderRadius: '8px' }} />
                  <Skeleton.Button active size="small" style={{ width: 80, borderRadius: '8px' }} />
                  <div style={{ marginLeft: 'auto' }}>
                    <Skeleton.Input active size="small" style={{ width: 100, borderRadius: '6px' }} />
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
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px 0 0 16px',
              margin: '16px 0 16px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
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
              minHeight: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0 16px 16px 0',
              margin: '16px 16px 16px 0',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}>
              {/* Outline Editor */}
              <div style={{ 
                flex: 1, 
                padding: 24, 
                overflow: 'auto',
                background: 'linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%)'
              }}>
                {outlineText.length > 0 ? (
                  <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    minHeight: '100%'
                  }}>
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
                    }}>📝</div>
                    <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>No content yet</div>
                    <div style={{ fontSize: 14, color: '#9ca3af' }}>Your outline will appear here</div>
                  </div>
                )}
              </div>

              {/* Bottom Controls */}
              <div style={{ 
                padding: '16px 24px', 
                background: 'rgba(248, 250, 252, 0.9)',
                borderRadius: '0 0 16px 0',
                flexShrink: 0,
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, alignItems: 'center' }}>
                  <Button 
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(outlineText);
                      message.success('内容已复制到剪贴板！');
                    }}
                    disabled={!outlineText}
                    type="primary"
                    style={{
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    📋 复制
                  </Button>
                  <Button 
                    size="small"
                    onClick={() => setOutlineText('')}
                    disabled={isGenerating || isChatProcessing}
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      background: 'white',
                      color: '#6b7280',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🗑️ 清除
                  </Button>
                  
                  {/* Episode Count Input */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ 
                      fontSize: 12, 
                      color: '#6b7280', 
                      fontWeight: 500,
                      whiteSpace: 'nowrap'
                    }}>
                      集数:
                    </span>
                    <Tooltip 
                      title={episodeCount > 5 ? "建议生成1-5集以获得更好的AI输出质量" : ""}
                      placement="top"
                    >
                      <InputNumber
                        size="small"
                        min={1}
                        max={20}
                        value={episodeCount}
                        onChange={(value) => setEpisodeCount(value || 3)}
                        style={{
                          width: 60,
                          borderRadius: '6px',
                          border: episodeCount > 5 ? '1px solid #faad14' : '1px solid #d9d9d9'
                        }}
                      />
                    </Tooltip>
                  </div>
                  
                  <Button 
                    size="small"
                    type="primary"
                    onClick={proceedToEpisodes}
                    disabled={isGenerating || isChatProcessing || !outlineText.trim()}
                    style={{
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🎬 创建剧集
                  </Button>
                  <div style={{ 
                    fontSize: 12, 
                    color: '#9ca3af', 
                    alignSelf: 'center',
                    marginLeft: 'auto',
                    padding: '4px 12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '6px',
                    border: '1px solid rgba(0, 0, 0, 0.06)',
                    fontWeight: 500
                  }}>
                    {outlineText.length.toLocaleString()} 字符
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