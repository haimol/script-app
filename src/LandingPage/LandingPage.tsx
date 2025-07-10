import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, Radio, Space, Divider } from "antd";
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
    <div className="api-config-form-container">
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

          {/* Story Synopsis Field */}
          <Form.Item 
            label="故事梗概 (Story Synopsis):" 
            name="storySynopsis"
            rules={[
              { required: true, message: '故事梗概 is required!' }
            ]}
            tooltip="Provide a brief synopsis of your story"
          >
            <TextArea 
              rows={3}
              placeholder="请输入故事梗概..."
              className="app-description-textarea"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Divider />

          {/* Character Elements Section */}
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>人物要素 (Character Elements)</span>
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
            style={{ marginBottom: 16 }}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Form.Item 
                      label="身份:" 
                      style={{ marginBottom: 8 }}
                      required
                    >
                      <Input 
                        placeholder="角色身份"
                        value={character.identity}
                        onChange={(e) => updateCharacter(character.id, 'identity', e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item 
                      label="欲望:" 
                      style={{ marginBottom: 8 }}
                      required
                    >
                      <Input 
                        placeholder="角色欲望"
                        value={character.desire}
                        onChange={(e) => updateCharacter(character.id, 'desire', e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item 
                      label="动作:" 
                      style={{ marginBottom: 8 }}
                      required
                    >
                      <Input 
                        placeholder="角色动作"
                        value={character.action}
                        onChange={(e) => updateCharacter(character.id, 'action', e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item 
                      label="设计思路:" 
                      style={{ marginBottom: 8 }}
                    >
                      <TextArea 
                        rows={2}
                        placeholder="设计思路 (可选)"
                        value={character.designConcept}
                        onChange={(e) => updateCharacter(character.id, 'designConcept', e.target.value)}
                      />
                    </Form.Item>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>

          {/* Event Elements Section */}
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>事件要素 (Event Elements)</span>
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
            style={{ marginBottom: 16 }}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Form.Item 
                      label="核心问题:" 
                      style={{ marginBottom: 8 }}
                      required
                    >
                      <Input 
                        placeholder="核心问题"
                        value={event.coreProblem}
                        onChange={(e) => updateEvent(event.id, 'coreProblem', e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item 
                      label="主要障碍:" 
                      style={{ marginBottom: 8 }}
                      required
                    >
                      <Input 
                        placeholder="主要障碍"
                        value={event.mainObstacle}
                        onChange={(e) => updateEvent(event.id, 'mainObstacle', e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item 
                      label="结果:" 
                      style={{ marginBottom: 8 }}
                      required
                    >
                      <Input 
                        placeholder="事件结果"
                        value={event.result}
                        onChange={(e) => updateEvent(event.id, 'result', e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item 
                      label="设计思路:" 
                      style={{ marginBottom: 8 }}
                    >
                      <TextArea 
                        rows={2}
                        placeholder="设计思路 (可选)"
                        value={event.designConcept}
                        onChange={(e) => updateEvent(event.id, 'designConcept', e.target.value)}
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
                <span>主题思想 (Main Theme)</span>
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
            style={{ marginBottom: 16 }}
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Form.Item 
                      label="正价值:" 
                      style={{ marginBottom: 8 }}
                      required
                    >
                      <Input 
                        placeholder="正价值"
                        value={theme.positiveValue}
                        onChange={(e) => updateTheme(theme.id, 'positiveValue', e.target.value)}
                      />
                    </Form.Item>
                    <Form.Item 
                      label="负价值:" 
                      style={{ marginBottom: 8 }}
                      required
                    >
                      <Input 
                        placeholder="负价值"
                        value={theme.negativeValue}
                        onChange={(e) => updateTheme(theme.id, 'negativeValue', e.target.value)}
                      />
                    </Form.Item>
                                         <Form.Item 
                       label="设计思路:" 
                       style={{ marginBottom: 8, gridColumn: '1 / -1' }}
                     >
                      <TextArea 
                        rows={2}
                        placeholder="设计思路 (可选)"
                        value={theme.designConcept}
                        onChange={(e) => updateTheme(theme.id, 'designConcept', e.target.value)}
                      />
                    </Form.Item>
                  </div>
                </Card>
              ))}
            </Space>
          </Card>

          {/* Submit Button with keyboard shortcut hint */}
          <Form.Item className="submit-form-item">
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              loading={loading}
              className="submit-button"
              onClick={() => console.log('🔴 Submit button clicked')}
            >
              {loading 
                ? 'Processing...' 
                : hasValidOutlineData() 
                  ? 'Create New Project' 
                  : 'Create Project'
              }
            </Button>
            <Text className="keyboard-hint">
              ⌘+Enter
            </Text>
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