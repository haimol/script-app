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
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '24px',
      background: '#f8fafc'
    }}>
      {/* Show continue editing option if there's existing data */}
      {hasValidOutlineData() && (
        <Card 
          style={{ 
            marginBottom: 24,
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderColor: '#52c41a'
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
            <Button 
              size="large"
              onClick={() => navigate('/episodes')}
            >
              Manage Episodes
            </Button>
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
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}
      >
        {hasValidOutlineData() && (
          <div style={{ 
            marginBottom: 24, 
            padding: '12px 16px', 
            background: '#fff7e6', 
            border: '1px solid #ffd591',
            borderRadius: 6,
            textAlign: 'center'
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
            storySynopsis: "一个关于年轻程序员发现古老AI系统的科幻故事。在不久的将来，主角意外激活了一个被遗忘的人工智能，这个AI声称拥有预测未来的能力。随着故事的发展，主角必须在信任这个神秘AI和保护人类免受其潜在威胁之间做出选择。",
            ...initialValues // Merge with any provided initial values
          }}
          className="api-config-form"
          onKeyDown={handleKeyPress}
          scrollToFirstError
        >
          {/* AI Provider Selection */}
          <Form.Item 
            label="AI Provider:" 
            name="aiProvider"
            rules={[
              { required: true, message: 'Please select an AI provider!' }
            ]}
            tooltip="Choose which AI service to use for generating your script"
          >
            <Radio.Group buttonStyle="solid" size="large">
              <Radio.Button value="deepseek">DeepSeek</Radio.Button>
              <Radio.Button value="openai">OpenAI</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* API Key Field - Password input for security */}
          <Form.Item 
            label="API key:" 
            name="apiKey"
            rules={[
              { required: true, message: 'API key is required!' }
            ]}
            tooltip="Your API key for the selected AI provider"
            validateStatus=""
            help="" // This will show validation errors more clearly
          >
            <Input.Password 
              placeholder="Enter your API key"
              className="api-key-input"
            />
          </Form.Item>

          {/* Story Synopsis Field - Enhanced */}
          <Card 
            style={{ 
              marginBottom: 24, 
              borderRadius: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              borderLeft: '4px solid #fa8c16'
            }}
            title={<span style={{ fontSize: 16, fontWeight: 600, color: '#fa8c16' }}>故事梗概 (Story Synopsis)</span>}
          >
            <Form.Item 
              name="storySynopsis"
              rules={[
                { required: true, message: '请输入故事梗概' }
              ]}
              style={{ marginBottom: 0 }}
            >
              <TextArea 
                rows={5}
                placeholder="请详细描述您的故事：包括背景设定、主要情节、核心冲突、目标受众等信息..."
                showCount
                maxLength={1000}
                style={{ borderRadius: 8, fontSize: 14 }}
              />
            </Form.Item>
          </Card>

          {/* Two-Column Layout for Form Sections */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Character Elements Section */}
              <Card 
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>人物要素 (Character Elements)</span>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      size="small"
                      onClick={addCharacter}
                    >
                      添加人物
                    </Button>
                  </div>
                }
                style={{ 
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderLeft: '4px solid #1890ff',
                  height: 'fit-content'
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <Form.Item 
                            label={<span style={{ fontWeight: 500, color: '#333' }}>身份 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="例如：主角、反派、配角"
                              value={character.identity}
                              onChange={(e) => updateCharacter(character.id, 'identity', e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                          <Form.Item 
                            label={<span style={{ fontWeight: 500, color: '#333' }}>欲望 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="核心动机"
                              value={character.desire}
                              onChange={(e) => updateCharacter(character.id, 'desire', e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                          <Form.Item 
                            label={<span style={{ fontWeight: 500, color: '#333' }}>动作 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="行为方式"
                              value={character.action}
                              onChange={(e) => updateCharacter(character.id, 'action', e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                        </div>
                        <Form.Item 
                          label={<span style={{ fontWeight: 500, color: '#666' }}>设计思路</span>}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea 
                            rows={2}
                            placeholder="角色设计理念、背景故事、性格特点等..."
                            value={character.designConcept}
                            onChange={(e) => updateCharacter(character.id, 'designConcept', e.target.value)}
                            style={{ borderRadius: 8 }}
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
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#722ed1' }}>主题思想 (Main Theme)</span>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      size="small"
                      onClick={addTheme}
                    >
                      添加主题
                    </Button>
                  </div>
                }
                style={{ 
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderLeft: '4px solid #722ed1',
                  height: 'fit-content'
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <Form.Item 
                            label={<span style={{ fontWeight: 500, color: '#333' }}>正价值 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="积极价值观"
                              value={theme.positiveValue}
                              onChange={(e) => updateTheme(theme.id, 'positiveValue', e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                          <Form.Item 
                            label={<span style={{ fontWeight: 500, color: '#333' }}>负价值 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="负面价值观"
                              value={theme.negativeValue}
                              onChange={(e) => updateTheme(theme.id, 'negativeValue', e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                        </div>
                        <Form.Item 
                          label={<span style={{ fontWeight: 500, color: '#666' }}>设计思路</span>}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea 
                            rows={2}
                            placeholder="主题探讨的深度、社会意义、价值观冲突的展现方式等..."
                            value={theme.designConcept}
                            onChange={(e) => updateTheme(theme.id, 'designConcept', e.target.value)}
                            style={{ borderRadius: 8 }}
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
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#52c41a' }}>事件要素 (Event Elements)</span>
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      size="small"
                      onClick={addEvent}
                    >
                      添加事件
                    </Button>
                  </div>
                }
                style={{ 
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  borderLeft: '4px solid #52c41a',
                  height: 'fit-content'
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                          <Form.Item 
                            label={<span style={{ fontWeight: 500, color: '#333' }}>核心问题 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="主要冲突点"
                              value={event.coreProblem}
                              onChange={(e) => updateEvent(event.id, 'coreProblem', e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                          <Form.Item 
                            label={<span style={{ fontWeight: 500, color: '#333' }}>主要障碍 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="阻碍因素"
                              value={event.mainObstacle}
                              onChange={(e) => updateEvent(event.id, 'mainObstacle', e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                          <Form.Item 
                            label={<span style={{ fontWeight: 500, color: '#333' }}>结果 *</span>}
                            style={{ marginBottom: 0 }}
                          >
                            <Input 
                              placeholder="最终结果"
                              value={event.result}
                              onChange={(e) => updateEvent(event.id, 'result', e.target.value)}
                              style={{ borderRadius: 8 }}
                            />
                          </Form.Item>
                        </div>
                        <Form.Item 
                          label={<span style={{ fontWeight: 500, color: '#666' }}>设计思路</span>}
                          style={{ marginBottom: 0 }}
                        >
                          <TextArea 
                            rows={2}
                            placeholder="事件的设计理念、象征意义、剧情推进作用等..."
                            value={event.designConcept}
                            onChange={(e) => updateEvent(event.id, 'designConcept', e.target.value)}
                            style={{ borderRadius: 8 }}
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
            marginTop: 32, 
            marginBottom: 0, 
            textAlign: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderRadius: 12,
            border: '1px solid #e2e8f0'
          }}>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              loading={loading}
              style={{
                height: 48,
                padding: '0 32px',
                fontSize: 16,
                fontWeight: 600,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                minWidth: 200
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
            <div style={{ marginTop: 12 }}>
              <Text style={{ 
                fontSize: 12, 
                color: '#64748b',
                background: 'rgba(255, 255, 255, 0.8)',
                padding: '4px 12px',
                borderRadius: 8,
                border: '1px solid rgba(0, 0, 0, 0.06)'
              }}>
                快捷键: ⌘+Enter (Mac) / Ctrl+Enter (Windows)
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