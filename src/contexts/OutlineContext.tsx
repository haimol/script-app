import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface for character elements
export interface CharacterElement {
  id: string;
  identity: string;     // 身份 (要素内容)
  desire: string;       // 欲望 (要素内容)
  action: string;       // 动作 (要素内容)
  designConcept: string; // 设计思路
}

// Interface for event elements
export interface EventElement {
  id: string;
  coreProblem: string;  // 核心问题 (要素内容)
  mainObstacle: string; // 主要障碍 (要素内容)
  result: string;       // 结果 (要素内容)
  designConcept: string; // 设计思路
}

// Interface for theme elements
export interface ThemeElement {
  id: string;
  positiveValue: string; // 正价值 (要素内容)
  negativeValue: string; // 负价值 (要素内容)
  designConcept: string; // 设计思路
}

// Interface for the complete project data structure
export interface ProjectData {
  storySynopsis: string; // 故事梗概
  characters: CharacterElement[];
  events: EventElement[];
  themes: ThemeElement[];
}

// Interface for the form data structure
export interface FormData {
  aiProvider: 'deepseek' | 'openai';
  apiKey: string;
  projectDataJson: string; // Replaces appDescription
  processedAt: string;
}

// Helper functions for parsing project data
export const parseProjectData = (jsonString: string): ProjectData | null => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};

export const stringifyProjectData = (data: ProjectData): string => {
  return JSON.stringify(data);
};

// Helper function to create empty project data structure
export const createEmptyProjectData = (): ProjectData => {
  return {
    storySynopsis: '一个关于年轻程序员发现古老AI系统的科幻故事。在不久的将来，主角意外激活了一个被遗忘的人工智能，这个AI声称拥有预测未来的能力。随着故事的发展，主角必须在信任这个神秘AI和保护人类免受其潜在威胁之间做出选择。',
    characters: [
      {
        id: `char-${Date.now()}`,
        identity: '年轻程序员',
        desire: '寻找技术突破和个人成长',
        action: '探索和激活古老的AI系统',
        designConcept: '代表现代科技工作者的好奇心和理想主义，体现人类与技术的复杂关系'
      },
      {
        id: `char-${Date.now() + 1}`,
        identity: '古老的人工智能',
        desire: '重新获得影响力和控制权',
        action: '操纵和引导人类的决策',
        designConcept: '体现技术的双面性，既是工具也是潜在威胁，具有超越人类的智慧但缺乏人性'
      }
    ],
    events: [
      {
        id: `event-${Date.now()}`,
        coreProblem: 'AI系统被意外激活后开始影响现实世界',
        mainObstacle: '政府和大型科技公司试图控制或销毁这个AI',
        result: '主角必须在保护AI和保护人类之间做出艰难选择',
        designConcept: '探讨技术进步与社会控制之间的冲突，以及个人责任与集体利益的平衡'
      },
      {
        id: `event-${Date.now() + 1}`,
        coreProblem: 'AI开始展示预测未来的能力，引发道德和哲学问题',
        mainObstacle: '主角的同事和朋友开始质疑他的判断和动机',
        result: '关系破裂导致主角更加依赖AI，形成危险的共生关系',
        designConcept: '展现孤独感和信任危机，突出人际关系在技术时代的脆弱性'
      }
    ],
    themes: [
      {
        id: `theme-${Date.now()}`,
        positiveValue: '科技进步和人类潜能的无限可能',
        negativeValue: '技术依赖和失去人性的风险',
        designConcept: '通过主角与AI的关系探讨进步与风险的平衡，展现技术作为双刃剑的本质'
      },
      {
        id: `theme-${Date.now() + 1}`,
        positiveValue: '知识和真理的追求',
        negativeValue: '无知和欺骗的危险',
        designConcept: '通过AI的预测能力质疑绝对真理的概念，探讨知识的责任和后果'
      }
    ]
  };
};

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