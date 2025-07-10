import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Radio, Space } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { 
  useOutlineContext, 
  ProjectData, 
  CharacterElement, 
  EventElement, 
  ThemeElement,
  createEmptyProjectData,
  stringifyProjectData 
} from "../contexts/OutlineContext";
import "./ApiConfigForm.css";

const { Text } = Typography;
const { TextArea } = Input;

// Interface for form data structure (local to this component)
interface ApiConfigFormData {
  aiProvider: 'deepseek' | 'openai';
  apiKey: string;
  storySynopsis: string;
  characters: CharacterElement[];
  events: EventElement[];
  themes: ThemeElement[];
}

// Props interface for the component
interface ApiConfigFormProps {
  onSubmit?: (formData: any) => void; // Callback to pass data to parent
  initialValues?: any; // Optional initial values
  loading?: boolean; // Optional loading state
}

const LandingPage: React.FC<ApiConfigFormProps> = ({ 
  onSubmit, 
  initialValues,
  loading = false 
}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setFormData, hasValidOutlineData, clearOutlineData } = useOutlineContext();

  // Initialize form with sample project data
  const [projectData, setProjectData] = useState<ProjectData>(createEmptyProjectData());

  // Helper function to generate unique IDs
  const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random()}`;

  // Character management functions
  const addCharacter = () => {
    const newCharacter: CharacterElement = {
      id: generateId('char'),
      identity: '',
      desire: '',
      action: '',
      designConcept: ''
    };
    setProjectData(prev => ({
      ...prev,
      characters: [...prev.characters, newCharacter]
    }));
  };

  const removeCharacter = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      characters: prev.characters.filter(char => char.id !== id)
    }));
  };

  const updateCharacter = (id: string, field: keyof CharacterElement, value: string) => {
    setProjectData(prev => ({
      ...prev,
      characters: prev.characters.map(char => 
        char.id === id ? { ...char, [field]: value } : char
      )
    }));
  };

  // Event management functions
  const addEvent = () => {
    const newEvent: EventElement = {
      id: generateId('event'),
      coreProblem: '',
      mainObstacle: '',
      result: '',
      designConcept: ''
    };
    setProjectData(prev => ({
      ...prev,
      events: [...prev.events, newEvent]
    }));
  };

  const removeEvent = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      events: prev.events.filter(event => event.id !== id)
    }));
  };

  const updateEvent = (id: string, field: keyof EventElement, value: string) => {
    setProjectData(prev => ({
      ...prev,
      events: prev.events.map(event => 
        event.id === id ? { ...event, [field]: value } : event
      )
    }));
  };

  // Theme management functions
  const addTheme = () => {
    const newTheme: ThemeElement = {
      id: generateId('theme'),
      positiveValue: '',
      negativeValue: '',
      designConcept: ''
    };
    setProjectData(prev => ({
      ...prev,
      themes: [...prev.themes, newTheme]
    }));
  };

  const removeTheme = (id: string) => {
    setProjectData(prev => ({
      ...prev,
      themes: prev.themes.filter(theme => theme.id !== id)
    }));
  };

  const updateTheme = (id: string, field: keyof ThemeElement, value: string) => {
    setProjectData(prev => ({
      ...prev,
      themes: prev.themes.map(theme => 
        theme.id === id ? { ...theme, [field]: value } : theme
      )
    }));
  };

  // Handle form submission
  const handleFinish = (values: any) => {
    console.log('🚀 Form handleFinish called with values:', values);
    
    // Parse and process form data
    const finalProjectData: ProjectData = {
      storySynopsis: values.storySynopsis || '',
      characters: projectData.characters,
      events: projectData.events,
      themes: projectData.themes
    };

    const parsedData = {
      aiProvider: values.aiProvider,
      apiKey: values.apiKey,
      projectDataJson: stringifyProjectData(finalProjectData),
      processedAt: new Date().toISOString(),
    };
    
    console.log('📤 Clearing existing data and storing new form data...');
    
    // Clear existing data first, then set new data for fresh start
    clearOutlineData();
    setFormData(parsedData);
    
    // Navigate to outline page
    navigate('/outline', { 
      state: { formData: parsedData } 
    });
    
    // Also call the parent callback for backward compatibility
    onSubmit?.(values);
    console.log('✅ Navigation completed with fresh data');
  };



  // Handle keyboard shortcut (Cmd+Enter / Ctrl+Enter)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      form.submit();
    }
  };

  return (
    <div className="api-config-form-container" style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '32px 24px',
      background: '#f8fafc',
      minHeight: '100vh',
      position: 'relative'
    }}>
      {/* Show continue editing option if there's existing data */}
      {hasValidOutlineData() && (
        <Card 
          style={{ 
            marginBottom: 32,
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            overflow: 'hidden'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
              ✨ You have an existing outline!
            </Text>
            <br />
            <Text type="secondary" style={{ display: 'block', margin: '8px 0 16px' }}>
              Continue working on your script or create a new one below
            </Text>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/outline')}
              style={{ marginRight: 12 }}
            >
              Continue Editing Outline
            </Button>
            {/* DEMO: Manage Episodes button commented out for client demo */}
            {/* <Button 
              size="large"
              onClick={() => navigate('/episodes')}
            >
              Manage Episodes
            </Button> */}
            <br />
            <Button 
              type="link" 
              size="small"
              onClick={() => {
                clearOutlineData();
                form.resetFields();
                setProjectData(createEmptyProjectData());
              }}
              style={{ marginTop: 8, color: '#ff4d4f' }}
            >
              Start Fresh (Clear All Data)
            </Button>
          </div>
        </Card>
      )}
      
      <Card 
        className="api-config-card"
        style={{ 
          borderRadius: 20,
          boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {hasValidOutlineData() && (
          <div style={{ 
            marginBottom: 32, 
            padding: '20px 24px', 
            background: 'linear-gradient(135deg, #fff7e6 0%, #fef3e2 100%)', 
            border: 'none',
            borderRadius: 12,
            textAlign: 'center',
            boxShadow: '0 8px 25px rgba(255, 193, 7, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Text style={{ color: '#d46b08', fontWeight: 500 }}>
              ⚠️ Creating New Project
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Submitting this form will clear your current outline and create a new project
            </Text>
          </div>
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          onFinishFailed={(errorInfo) => {
            console.log('❌ Form validation failed:', errorInfo);
            console.log('❌ Error fields:', errorInfo.errorFields);
            // Scroll to first error field
            form.scrollToField(errorInfo.errorFields[0].name);
          }}
          initialValues={{
            aiProvider: "deepseek",
            apiKey: "sk-08fc30a4bed1498f94c48b34635347e6",
            storySynopsis: projectData.storySynopsis, // Use context data like other sections
            ...initialValues // Merge with any provided initial values
          }}
          className="api-config-form"
          onKeyDown={handleKeyPress}
          scrollToFirstError
        >
          {/* AI Provider Selection */}
          <Form.Item 
            label={<span style={{ fontSize: 16, fontWeight: 600, color: '#1a202c' }}>AI Provider</span>}
            name="aiProvider"
            rules={[
              { required: true, message: 'Please select an AI provider!' }
            ]}
            tooltip="Choose which AI service to use for generating your script"
            style={{ marginBottom: 28 }}
          >
            <Radio.Group 
              buttonStyle="solid" 
              size="large"
              style={{ 
                display: 'flex', 
                gap: '12px',
                background: '#f8fafc',
                padding: '8px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}
            >
              <Radio.Button 
                value="deepseek"
                style={{
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 500,
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  justifyContent: 'center'
                }}
              >
                DeepSeek
              </Radio.Button>
              <Radio.Button 
                value="openai"
                style={{
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 500,
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1,
                  justifyContent: 'center'
                }}
              >
                OpenAI
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* API Key Field - Password input for security */}
          <Form.Item 
            label={<span style={{ fontSize: 16, fontWeight: 600, color: '#1a202c' }}>API Key</span>}
            name="apiKey"
            rules={[
              { required: true, message: 'API key is required!' }
            ]}
            tooltip="Your API key for the selected AI provider"
            style={{ marginBottom: 32 }}
          >
            <Input.Password 
              placeholder="Enter your API key"
              size="large"
              style={{
                borderRadius: '12px',
                border: '2px solid #e2e8f0',
                fontSize: '14px',
                height: '48px'
              }}
            />
          </Form.Item>

          {/* Story Synopsis Field - Enhanced */}
          <Card 
            style={{ 
              marginBottom: 32, 
              borderRadius: 16,
              boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #fff9f0 0%, #fef5e7 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}
            title={
              <div style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                background: 'linear-gradient(135deg, #fa8c16 0%, #d48806 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📖 故事梗概 (Story Synopsis)
              </div>
            }
          >
          <Form.Item 
              name="storySynopsis"
            rules={[
                { required: true, message: '请输入故事梗概' }
            ]}
              style={{ marginBottom: 0 }}
          >
            <TextArea 
                rows={6}
                placeholder="请详细描述您的故事：包括背景设定、主要情节、核心冲突、目标受众等信息..."
              showCount
                maxLength={1000}
                style={{ 
                  borderRadius: 12, 
                  fontSize: 15,
                  border: '2px solid #e2e8f0',
                  background: 'rgba(255, 255, 255, 0.8)',
                  lineHeight: 1.6,
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}
              />
            </Form.Item>
          </Card>

          {/* Two-Column Layout for Form Sections */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))', 
            gap: '32px',
            marginBottom: '32px',
            alignItems: 'start'
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Character Elements Section */}
                              <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ 
                        fontSize: 18, 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        👥 人物要素 (Character Elements)
                      </div>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        size="small"
                        onClick={addCharacter}
                        style={{
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                          fontWeight: 500
                        }}
                      >
                        添加人物
                      </Button>
                    </div>
                  }
                  style={{ 
                    borderRadius: 16,
                    boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                    border: 'none',
                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                    height: 'fit-content',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {projectData.characters.map((character, index) => (
                    <Card 
                      key={character.id}
                      size="small"
                      title={`人物 ${index + 1}`}
                      extra={
                        projectData.characters.length > 1 ? (
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => removeCharacter(character.id)}
                          />
                        ) : null
                      }
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* First row: Identity (full width for better readability) */}
                        <Form.Item 
                          label={<span style={{ fontWeight: 600, color: '#1a202c', fontSize: 14 }}>身份 *</span>}
                          style={{ marginBottom: 0 }}
                        >
                          <Input 
                            placeholder="例如：年轻程序员、古老的人工智能、政府特工..."
                            value={character.identity}
                            onChange={(e) => updateCharacter(character.id, 'identity', e.target.value)}
                            style={{ 
                              borderRadius: 10, 
                              height: 44,
                              fontSize: 15,
                              border: '2px solid #e2e8f0',
                              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                            }}
                            size="large"
                          />
                        </Form.Item>
                        
                        {/* Second row: Desire and Action (side by side but larger) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Form.Item 
                            label={<span style={{ fontWeight: 600, color: '#1a202c', fontSize: 14 }}>欲望 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea 
                              rows={2}
                              placeholder="寻找技术突破和个人成长、重新获得影响力和控制权..."
                              value={character.desire}
                              onChange={(e) => updateCharacter(character.id, 'desire', e.target.value)}
                              style={{ 
                                borderRadius: 10,
                                fontSize: 15,
                                border: '2px solid #e2e8f0',
                                lineHeight: 1.5,
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}
                            />
                          </Form.Item>
                          <Form.Item 
                            label={<span style={{ fontWeight: 600, color: '#1a202c', fontSize: 14 }}>动作 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea 
                              rows={2}
                              placeholder="探索和激活古老的AI系统、操纵和诱导人类的决策..."
                              value={character.action}
                              onChange={(e) => updateCharacter(character.id, 'action', e.target.value)}
                              style={{ 
                                borderRadius: 10,
                                fontSize: 15,
                                border: '2px solid #e2e8f0',
                                lineHeight: 1.5,
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}
                            />
                          </Form.Item>
                        </div>
                        
                        {/* Third row: Design concept (full width) */}
                        <Form.Item 
                          label={<span style={{ fontWeight: 600, color: '#4a5568', fontSize: 14 }}>设计思路</span>}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea 
                            rows={3}
                            placeholder="角色设计理念、背景故事、性格特点、成长弧线等详细描述..."
                            value={character.designConcept}
                            onChange={(e) => updateCharacter(character.id, 'designConcept', e.target.value)}
                            style={{ 
                              borderRadius: 10,
                              fontSize: 15,
                              border: '2px solid #e2e8f0',
                              lineHeight: 1.6,
                              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                              background: 'rgba(255, 255, 255, 0.8)'
                            }}
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                </Space>
              </Card>

              {/* Theme Elements Section */}
                              <Card 
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ 
                        fontSize: 18, 
                        fontWeight: 700, 
                        background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        🎭 主题思想 (Main Theme)
                      </div>
                      <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        size="small"
                        onClick={addTheme}
                        style={{
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(114, 46, 209, 0.3)',
                          fontWeight: 500
                        }}
                      >
                        添加主题
                      </Button>
                    </div>
                  }
                  style={{ 
                    borderRadius: 16,
                    boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                    border: 'none',
                    background: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)',
                    height: 'fit-content',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {projectData.themes.map((theme, index) => (
                    <Card 
                      key={theme.id}
                      size="small"
                      title={`主题 ${index + 1}`}
                      extra={
                        projectData.themes.length > 1 ? (
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => removeTheme(theme.id)}
                          />
                        ) : null
                      }
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Values section: side by side but larger */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Form.Item 
                            label={<span style={{ fontWeight: 600, color: '#1a202c', fontSize: 14 }}>正价值 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea 
                              rows={2}
                              placeholder="人类与技术的和谐共存、理性思考和道德责任..."
                              value={theme.positiveValue}
                              onChange={(e) => updateTheme(theme.id, 'positiveValue', e.target.value)}
                              style={{ 
                                borderRadius: 10,
                                fontSize: 15,
                                border: '2px solid #e2e8f0',
                                lineHeight: 1.5,
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}
                            />
                          </Form.Item>
                          <Form.Item 
                            label={<span style={{ fontWeight: 600, color: '#1a202c', fontSize: 14 }}>负价值 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea 
                              rows={2}
                              placeholder="技术至上主义、个人贪婪和权力集中..."
                              value={theme.negativeValue}
                              onChange={(e) => updateTheme(theme.id, 'negativeValue', e.target.value)}
                              style={{ 
                                borderRadius: 10,
                                fontSize: 15,
                                border: '2px solid #e2e8f0',
                                lineHeight: 1.5,
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}
                            />
                          </Form.Item>
                        </div>
                        
                        {/* Design concept (full width) */}
                        <Form.Item 
                          label={<span style={{ fontWeight: 600, color: '#4a5568', fontSize: 14 }}>设计思路</span>}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea 
                            rows={3}
                            placeholder="主题探讨的深度、社会意义、价值观冲突的展现方式、现实关联性等详细描述..."
                            value={theme.designConcept}
                            onChange={(e) => updateTheme(theme.id, 'designConcept', e.target.value)}
                            style={{ 
                              borderRadius: 10,
                              fontSize: 15,
                              border: '2px solid #e2e8f0',
                              lineHeight: 1.6,
                              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                              background: 'rgba(255, 255, 255, 0.8)'
                            }}
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                </Space>
              </Card>
            </div>

            {/* Right Column */}
            <div>
              {/* Event Elements Section */}
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ 
                      fontSize: 18, 
                      fontWeight: 700, 
                      background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      ⚡ 事件要素 (Event Elements)
                    </div>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      size="small"
                      onClick={addEvent}
                      style={{
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(82, 196, 26, 0.3)',
                        fontWeight: 500
                      }}
                    >
                      添加事件
                    </Button>
                  </div>
                }
                style={{ 
                  borderRadius: 16,
                  boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #e6f7e0 100%)',
                  height: 'fit-content',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {projectData.events.map((event, index) => (
                    <Card 
                      key={event.id}
                      size="small"
                      title={`事件 ${index + 1}`}
                      extra={
                        projectData.events.length > 1 ? (
                          <Button 
                            type="text" 
                            danger 
                            icon={<DeleteOutlined />}
                            size="small"
                            onClick={() => removeEvent(event.id)}
                          />
                        ) : null
                      }
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* First row: Core Problem (full width for better readability) */}
                        <Form.Item 
                          label={<span style={{ fontWeight: 600, color: '#1a202c', fontSize: 14 }}>核心问题 *</span>}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea 
                            rows={2}
                            placeholder="AI系统被意外激活后开始挑战人类的决策、政府和大型科技公司试图掌控新技术..."
                            value={event.coreProblem}
                            onChange={(e) => updateEvent(event.id, 'coreProblem', e.target.value)}
                            style={{ 
                              borderRadius: 10,
                              fontSize: 15,
                              border: '2px solid #e2e8f0',
                              lineHeight: 1.5,
                              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                            }}
            />
          </Form.Item>
                        
                        {/* Second row: Obstacle and Result (side by side but larger) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <Form.Item 
                            label={<span style={{ fontWeight: 600, color: '#1a202c', fontSize: 14 }}>主要障碍 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea 
                              rows={2}
                              placeholder="政府和大型科技公司试图阻挠、同事间的信任危机..."
                              value={event.mainObstacle}
                              onChange={(e) => updateEvent(event.id, 'mainObstacle', e.target.value)}
                              style={{ 
                                borderRadius: 10,
                                fontSize: 15,
                                border: '2px solid #e2e8f0',
                                lineHeight: 1.5,
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}
                            />
                          </Form.Item>
                          <Form.Item 
                            label={<span style={{ fontWeight: 600, color: '#1a202c', fontSize: 14 }}>结果 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <TextArea 
                              rows={2}
                              placeholder="主角必须在保护AI和保护人类之间做出选择、关系破裂导致敌对加剧..."
                              value={event.result}
                              onChange={(e) => updateEvent(event.id, 'result', e.target.value)}
                              style={{ 
                                borderRadius: 10,
                                fontSize: 15,
                                border: '2px solid #e2e8f0',
                                lineHeight: 1.5,
                                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}
                            />
                          </Form.Item>
                        </div>
                        
                        {/* Third row: Design concept (full width) */}
                        <Form.Item 
                          label={<span style={{ fontWeight: 600, color: '#4a5568', fontSize: 14 }}>设计思路</span>}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea 
                            rows={3}
                            placeholder="事件的设计理念、象征意义、剧情推进作用、与主题的关系等详细描述..."
                            value={event.designConcept}
                            onChange={(e) => updateEvent(event.id, 'designConcept', e.target.value)}
                            style={{ 
                              borderRadius: 10,
                              fontSize: 15,
                              border: '2px solid #e2e8f0',
                              lineHeight: 1.6,
                              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                              background: 'rgba(255, 255, 255, 0.8)'
                            }}
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                </Space>
              </Card>
            </div>
          </div>

          {/* Submit Button with keyboard shortcut hint */}
          <Form.Item style={{ 
            marginTop: 40, 
            marginBottom: 0, 
            textAlign: 'center',
            padding: '32px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
            borderRadius: 20,
            border: 'none',
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              loading={loading}
                style={{
                  height: 56,
                  padding: '0 40px',
                  fontSize: 17,
                  fontWeight: 700,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                  minWidth: 220,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
                }}
              onClick={() => console.log('🔴 Submit button clicked')}
            >
              {loading 
                ? '🚀 Processing...' 
                : hasValidOutlineData() 
                  ? '✨ Create New Project' 
                  : '🎬 Create Project'
              }
            </Button>
                          <div style={{ marginTop: 20 }}>
                <Text style={{ 
                  fontSize: 13, 
                  color: '#64748b',
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  fontWeight: 500,
                  backdropFilter: 'blur(10px)'
                }}>
                  ⚡ 快捷键: ⌘+Enter (Mac) / Ctrl+Enter (Windows)
            </Text>
              </div>
          </Form.Item>
        </Form>
      </Card>
      
      {/* Footer credits */}
      <div className="form-footer">
        <Text type="secondary">
          Tsinghua University
        </Text>
        <br />
        <Text type="secondary">
          github
        </Text>
      </div>
    </div>
  );
};

export default LandingPage;
export type { ApiConfigFormData, ApiConfigFormProps }; 