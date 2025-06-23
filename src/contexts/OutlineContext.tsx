import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface for the form data structure
export interface FormData {
  aiProvider: 'deepseek' | 'openai';
  apiKey: string;
  appDescription: string;
  processedAt: string;
}

// Interface for chat messages
export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// Interface for outline data
export interface OutlineData {
  formData: FormData | null;
  outlineText: string;
  chatHistory: ChatMessage[];
  initialGenerationComplete: boolean;
  isGenerating: boolean;
  isChatProcessing: boolean;
}

// Context interface
interface OutlineContextType {
  outlineData: OutlineData;
  setFormData: (formData: FormData) => void;
  setOutlineText: (text: string) => void;
  setChatHistory: (history: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setInitialGenerationComplete: (complete: boolean) => void;
  setIsGenerating: (generating: boolean) => void;
  setIsChatProcessing: (processing: boolean) => void;
  clearOutlineData: () => void;
  hasValidOutlineData: () => boolean;
}

// Initial state
const initialOutlineData: OutlineData = {
  formData: null,
  outlineText: '',
  chatHistory: [],
  initialGenerationComplete: false,
  isGenerating: false,
  isChatProcessing: false,
};

// Create context
const OutlineContext = createContext<OutlineContextType | undefined>(undefined);

// Provider component
export const OutlineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [outlineData, setOutlineData] = useState<OutlineData>(initialOutlineData);

  const setFormData = (formData: FormData) => {
    setOutlineData(prev => ({ ...prev, formData }));
  };

  const setOutlineText = (text: string) => {
    setOutlineData(prev => ({ ...prev, outlineText: text }));
  };

  const setChatHistory = (history: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setOutlineData(prev => ({
      ...prev,
      chatHistory: typeof history === 'function' ? history(prev.chatHistory) : history
    }));
  };

  const setInitialGenerationComplete = (complete: boolean) => {
    setOutlineData(prev => ({ ...prev, initialGenerationComplete: complete }));
  };

  const setIsGenerating = (generating: boolean) => {
    setOutlineData(prev => ({ ...prev, isGenerating: generating }));
  };

  const setIsChatProcessing = (processing: boolean) => {
    setOutlineData(prev => ({ ...prev, isChatProcessing: processing }));
  };

  const clearOutlineData = () => {
    setOutlineData(initialOutlineData);
  };

  const hasValidOutlineData = () => {
    return !!(outlineData.formData && outlineData.outlineText.trim());
  };

  const value: OutlineContextType = {
    outlineData,
    setFormData,
    setOutlineText,
    setChatHistory,
    setInitialGenerationComplete,
    setIsGenerating,
    setIsChatProcessing,
    clearOutlineData,
    hasValidOutlineData,
  };

  return (
    <OutlineContext.Provider value={value}>
      {children}
    </OutlineContext.Provider>
  );
};

// Custom hook to use the context
export const useOutlineContext = () => {
  const context = useContext(OutlineContext);
  if (context === undefined) {
    throw new Error('useOutlineContext must be used within an OutlineProvider');
  }
  return context;
}; 