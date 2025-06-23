import React, { useState } from "react";
import { Layout, Typography } from "antd";
import { Route, Routes } from "react-router-dom";
import "./Menu.css";
import { ApiConfigFormData } from "../LandingPage/LandingPage";
import LandingPage from "../LandingPage/LandingPage";
import OutlinePage from "../OutlinePage/OutlinePage";
import EpisodePage from "../EpisodePage/EpisodePage";
import Side from "../components/Side";

const { Header, Content } = Layout;
const { Title } = Typography;

const MainFramework: React.FC = () => {
  // State to store form data received from the decoupled form component
  const [apiConfigData, setApiConfigData] = useState<ApiConfigFormData | null>(null);
  
  // State to persist form values across navigation
  const [persistedFormValues, setPersistedFormValues] = useState<Partial<ApiConfigFormData> | null>(null);
  
  // State for loading when processing form data
  const [isProcessingForm, setIsProcessingForm] = useState(false);

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

  /**
   * TODO: Add additional handler functions here for future features:
   * 
   * const handleShowPopup = () => { ... }
   * const handleNavigateToResults = () => { ... }
   * const handleResetForm = () => { ... }
   * const handleSaveConfig = () => { ... }
   */

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header section */}
      <Header 
        style={{ 
          background: '#ffffff', 
          borderBottom: '1px solid #d9d9d9',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Title level={4} style={{ margin: 0, color: '#333' }}>
          Script Writter
        </Title>
        
        {/* TODO: Add header navigation, user menu, or other header components here */}
      </Header>
      
      {/* Side navigation */}
      <Layout>
        <Side />
        
        {/* Main content area */}
        <Content 
          className="main-content-with-sidebar"
          style={{ 
            padding: '48px 24px', 
            background: '#f5f5f5'
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
