import React, { useState, useEffect } from "react";
import { Alert, Button, Spin, message } from "antd";
import { useLocation, Navigate } from "react-router-dom";
import OpenAI from "openai";
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';

// Interface for the form data structure
interface FormData {
  aiProvider: 'deepseek' | 'openai';
  apiKey: string;
  appDescription: string;
  processedAt: string;
}

const OutlinePage: React.FC = () => {
  const location = useLocation();
  const formData = location.state?.formData as FormData;
  const [outlineText, setOutlineText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // OpenAI API calling function
  const callOpenAI = async (prompt: string, apiKey: string): Promise<string> => {
    try {
      const openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
      });

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a professional script writer and creative assistant." },
          { role: "user", content: prompt }
        ],
        model: "gpt-4o", // or "gpt-3.5-turbo" for faster/cheaper
        max_tokens: 2000,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "No response generated.";
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // DeepSeek API calling function
  const callDeepSeek = async (prompt: string, apiKey: string): Promise<string> => {
    try {
      const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: apiKey,
        dangerouslyAllowBrowser: true // Note: In production, API calls should be made from backend
      });

      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: "You are a professional script writer and creative assistant." },
          { role: "user", content: prompt }
        ],
        model: "deepseek-chat",
        max_tokens: 2000,
        temperature: 0.7,
      });

      return completion.choices[0].message.content || "No response generated.";
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw new Error(`DeepSeek API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Main function to generate outline using AI
  const generateAIOutline = async () => {
    if (!formData || !formData.apiKey) {
      message.error('API key is required to generate AI outline');
      return;
    }

    setIsGenerating(true);

    try {
      // Create prompt based on user's description
      const prompt = `Create a detailed script outline for the following project:

Description: ${formData.appDescription}

Please provide a comprehensive script outline with the following structure:
1. Title and logline
2. Character descriptions
3. Scene-by-scene breakdown
4. Key dialogue points
5. Visual elements and staging notes

Make it professional and ready for production use.`;

      let aiResponse: string;

      // Call appropriate AI service based on user selection
      if (formData.aiProvider === 'openai') {
        console.log('🤖 Calling OpenAI API...');
        aiResponse = await callOpenAI(prompt, formData.apiKey);
      } else if (formData.aiProvider === 'deepseek') {
        console.log('🤖 Calling DeepSeek API...');
        aiResponse = await callDeepSeek(prompt, formData.apiKey);
      } else {
        throw new Error('Invalid AI provider selected');
      }

      // Set the AI-generated content
      setOutlineText(aiResponse);
      message.success(`Outline generated successfully using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)}!`);

    } catch (error) {
      console.error('AI Generation Error:', error);
      message.error(`Failed to generate outline: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate outline content from form data
  useEffect(() => {
    if (formData) {
      // Auto-generate AI outline when form data is available
      generateAIOutline();
    }
  }, [formData]);

  // Handle case where user navigates directly to outline without form data
  if (!formData) {
    return (
      <div style={{ padding: 24 }}>
        <Alert
          message="No Form Data Found"
          description="Please fill out the form first to generate an outline."
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary" onClick={() => window.history.back()}>
              Go Back to Form
            </Button>
          }
        />
                 <div style={{ marginTop: 16 }}>
           <MDEditor
             value={outlineText}
             onChange={(val) => setOutlineText(val || '')}
             preview="edit"
             hideToolbar={false}
             data-color-mode="light"
           />
         </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Alert
        message={isGenerating ? "Generating AI Outline..." : "AI Outline Ready!"}
        description={
          isGenerating 
            ? `Using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} to generate your script outline...`
            : `Generated using ${formData.aiProvider.charAt(0).toUpperCase() + formData.aiProvider.slice(1)} at ${new Date(formData.processedAt).toLocaleString()}`
        }
        type={isGenerating ? "info" : "success"}
        showIcon
        style={{ marginBottom: 16 }}
        action={
          !isGenerating && (
            <Button 
              size="small" 
              type="primary" 
              onClick={generateAIOutline}
              disabled={!formData.apiKey}
            >
              Regenerate
            </Button>
          )
        }
      />
      
      <Spin spinning={isGenerating} tip="Generating AI outline...">
        <div style={{ minHeight: '500px' }}>
          <MDEditor
            value={outlineText}
            onChange={(val) => setOutlineText(val || '')}
            preview="live"
            hideToolbar={isGenerating}
            data-color-mode="light"
            height={500}
          />
        </div>
      </Spin>
      
      {/* Additional controls */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        <Button 
          onClick={generateAIOutline}
          loading={isGenerating}
          disabled={!formData.apiKey}
          type="default"
        >
          {isGenerating ? 'Generating...' : 'Regenerate Outline'}
        </Button>
        <Button 
          onClick={() => setOutlineText('')}
          disabled={isGenerating}
        >
          Clear
        </Button>
      </div>
      
      {/* Debug info - Remove in production */}
      <details style={{ marginTop: 16, fontSize: 12, color: '#666' }}>
        <summary>Form Data (Debug Info)</summary>
        <pre style={{ background: '#f5f5f5', padding: 8, borderRadius: 4, marginTop: 8 }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default OutlinePage; 