import React from "react";
import { Form, Input, Button, Card, Typography, Radio } from "antd";
import { useNavigate } from "react-router-dom";
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

  // Handle form submission
  const handleFinish = (values: ApiConfigFormData) => {
    console.log('🚀 Form handleFinish called with values:', values);
    
    // Parse and process form data
    const parsedData = {
      ...values,
      processedAt: new Date().toISOString(),
      // TODO: Add any other processing logic here
    };
    
    console.log('📤 Processing form data and navigating to outline...');
    
    // Pass data through router state to outline page
    navigate('/outline', { 
      state: { formData: parsedData } 
    });
    
    // Also call the parent callback for backward compatibility
    onSubmit(values);
    console.log('✅ Navigation completed');
  };

  // Handle keyboard shortcut (Cmd+Enter / Ctrl+Enter)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      form.submit();
    }
  };

  return (
    <div className="api-config-form-container">
      <Card 
        className="api-config-card"
        style={{ 
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}
      >
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
              {loading ? 'Processing...' : 'Submit'}
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