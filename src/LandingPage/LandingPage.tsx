import React from "react";
import { Form, Input, Button, Card, Typography, Radio } from "antd";
import { useNavigate } from "react-router-dom";
import { useOutlineContext } from "../contexts/OutlineContext";
import "./ApiConfigForm.css";

const { Text } = Typography;
const { TextArea } = Input;

// Interface for form data structure
interface ApiConfigFormData {
  aiProvider: 'deepseek' | 'openai';
  apiKey: string;
  appDescription: string;
}

// Props interface for the component
interface ApiConfigFormProps {
  onSubmit: (formData: ApiConfigFormData) => void; // Callback to pass data to parent
  initialValues?: Partial<ApiConfigFormData>; // Optional initial values
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

  // Handle form submission
  const handleFinish = (values: ApiConfigFormData) => {
    console.log('🚀 Form handleFinish called with values:', values);
    
    // Parse and process form data
    const parsedData = {
      ...values,
      processedAt: new Date().toISOString(),
      // TODO: Add any other processing logic here
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
            appDescription: "Hello",
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



          {/* App Description Field */}
          <Form.Item 
            label="App Description:" 
            name="appDescription"
            rules={[
              { required: true, message: 'App description is required!' }
            ]}
            tooltip="Describe what kind of app you want to create"
          >
            <TextArea 
              rows={4}
              placeholder="Describe your app idea in detail..."
              className="app-description-textarea"
              showCount
              maxLength={500}
            />
          </Form.Item>

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