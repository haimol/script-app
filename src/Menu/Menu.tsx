import React, { useState, useEffect } from "react";
import { Layout, Typography, Badge } from "antd";
import { Route, Routes, useLocation } from "react-router-dom";
import { 
  HomeOutlined,
  EditOutlined,
  FileTextOutlined,
  RocketOutlined
} from '@ant-design/icons';
import "./Menu.css";
import { ApiConfigFormData } from "../LandingPage/LandingPage";
import LandingPage from "../LandingPage/LandingPage";
import OutlinePage from "../OutlinePage/OutlinePage";
import EpisodePage from "../EpisodePage/EpisodePage";
import Side from "../components/Side";
import { useOutlineContext } from "../contexts/OutlineContext";

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const MainFramework: React.FC = () => {
  const location = useLocation();
  const { hasValidOutlineData } = useOutlineContext();
  
  // State to store form data received from the decoupled form component
  const [apiConfigData, setApiConfigData] = useState<ApiConfigFormData | null>(null);
  
  // State to persist form values across navigation
  const [persistedFormValues, setPersistedFormValues] = useState<Partial<ApiConfigFormData> | null>(null);
  
  // State for loading when processing form data
  const [isProcessingForm, setIsProcessingForm] = useState(false);

  // State for sidebar collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 1000);

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      const isNarrow = window.innerWidth < 1000;
      setSidebarCollapsed(isNarrow);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Get current route info for breadcrumbs
  const getCurrentRouteInfo = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
        return {
          title: 'Home',
          subtitle: 'Create and configure your AI script',
          icon: <HomeOutlined />
        };
      case '/outline':
        return {
          title: 'Outline Editor',
          subtitle: 'Generate and refine your script outline',
          icon: <EditOutlined />
        };
      case '/episodes':
        return {
          title: 'Episode Manager',
          subtitle: 'Break down your outline into episodes',
          icon: <FileTextOutlined />
        };
      default:
        return {
          title: 'Script Writer',
          subtitle: 'AI-Powered Script Studio',
          icon: <RocketOutlined />
        };
    }
  };



  /**
   * Callback function to handle form submission from ApiConfigForm
   * This receives the form data from the child component
   * 
   * @param formData - The form data submitted by the user
   * 
   * TODO: Add your business logic here:
   * - Make API calls to OpenAI
   * - Show popup/modal with confirmation
   * - Navigate to results page
   * - Store data in global state
   * - Validate data before processing
   */
  const handleFormSubmit = async (formData: ApiConfigFormData) => {
    console.log('📝 Form data received in MainFramework:', formData);
    
    // Store form values for persistence across navigation
    setPersistedFormValues(formData);
    
    // Set loading state
    setIsProcessingForm(true);
    
    try {
      // Store the form data in component state
      setApiConfigData(formData);
      
      // TODO: Replace this setTimeout with your actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // TODO: Add your form processing logic here:
      // Example options:
      // 1. Show success popup: setShowSuccessModal(true)
      // 2. Navigate to results: navigate('/results', { state: { formData } })
      // 3. Call OpenAI API: await callOpenAIAPI(formData)
      // 4. Update global state: dispatch(setApiConfig(formData))
      
      console.log('✅ Form processing completed successfully');
      
    } catch (error) {
      console.error('❌ Error processing form:', error);
      
      // TODO: Add error handling here:
      // - Show error message to user
      // - Reset form if needed
      // - Log error to monitoring service
      
    } finally {
      // Reset loading state
      setIsProcessingForm(false);
    }
  };

  const routeInfo = getCurrentRouteInfo();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Enhanced Header section */}
      <Header 
        style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderBottom: 'none',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 20px rgba(102, 126, 234, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 1001,
          height: '72px'
        }}
      >
        {/* Left side - Logo and Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* App Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <RocketOutlined style={{ fontSize: '18px', color: 'white' }} />
            </div>
            <Title level={4} style={{ 
              margin: 0, 
              color: 'white',
              fontWeight: 700,
              fontSize: '18px'
            }}>
              Script Writer
            </Title>
          </div>


        </div>

        {/* Center - Current Page Info */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <div style={{ 
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '8px'
            }}>
              {routeInfo.icon}
              <Text strong style={{ 
                color: 'white', 
                fontSize: '16px',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                {routeInfo.title}
              </Text>
              {hasValidOutlineData() && location.pathname !== '/' && (
                <Badge 
                  count="●" 
                  style={{ 
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)'
                  }} 
                />
              )}
            </div>
            <Text style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '12px',
              fontWeight: 400,
              whiteSpace: 'nowrap'
            }}>
              {routeInfo.subtitle}
            </Text>
          </div>
        </div>

        {/* Right side - Project Status Only */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: '120px' }}>
          {hasValidOutlineData() && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '20px',
              padding: '6px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                background: '#10b981',
                borderRadius: '50%'
              }} />
              <Text style={{ 
                color: 'white', 
                fontSize: '11px',
                fontWeight: 500
              }}>
                Project Active
              </Text>
            </div>
          )}
        </div>
      </Header>
      
      {/* Side navigation */}
      <Layout>
        <Side collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
        
        {/* Main content area */}
        <Content 
          style={{ 
            padding: '32px 32px 32px 32px', 
            background: '#f8fafc',
            minHeight: 'calc(100vh - 72px)',
            marginLeft: sidebarCollapsed ? '64px' : '220px',
            transition: 'margin-left 0.3s ease'
          }}
        >
          {/* Routes for navigation */}
          <Routes>
            <Route path="/" element={
              <LandingPage 
                onSubmit={handleFormSubmit} 
                initialValues={persistedFormValues || undefined}
              />
            } />
            <Route path="/outline" element={<OutlinePage />} />
            <Route path="/episodes" element={<EpisodePage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainFramework;
