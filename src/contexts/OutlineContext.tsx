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
  scriptRequirement: string; // 剧本要求
  narrativeStyle: 'linear' | 'flashback' | 'intercut'; // 剧本陈述方式
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

// Helper function to create truly empty project data structure  
export const createEmptyProjectData = (): ProjectData => {
  return {
    storySynopsis: "",
    scriptRequirement: "",
    narrativeStyle: 'linear' as const,
    characters: [
      {
        id: `char-${Date.now()}-${Math.random()}`,
        identity: '',
        desire: '',
        action: '',
        designConcept: ''
      }
    ],
    events: [
      {
        id: `event-${Date.now()}-${Math.random()}`,
        coreProblem: '',
        mainObstacle: '',
        result: '',
        designConcept: ''
      }
    ],
    themes: [
      {
        id: `theme-${Date.now()}-${Math.random()}`,
        positiveValue: '',
        negativeValue: '',
        designConcept: ''
      }
    ]
  };
};

// Helper function to create demo project data with pre-filled example
export const createDemoProjectData = (): ProjectData => {
  return {
    storySynopsis: "牧琳爱，1919年生于美国富裕家庭，青年时期被中国战乱与贫困的报道触动，毅然放弃优渥生活，于1941年独自赴华从事医疗救助。她在战火与贫困中奔波数十年，入籍中国，并在2002年变卖祖传庄园，捐资建成聊城国际和平医院，长期为贫困患者提供免费治疗。2009年，在一场剖腹产手术中突发心梗，她拒绝抢救自己，坚持先救产妇和孩子。2010年，她在聊城去世，留下跨越国界的大爱与无私奉献的传奇，证明生命与爱无国界。",
    scriptRequirement: "人物传记片，呈现医者仁心与无私奉献的生命抉择",
    narrativeStyle: 'flashback' as const,
    characters: [
      {
        id: 'char-mu-linai',
        identity: '医生、慈善家、外籍志愿者、无私奉献者',
        desire: '用医疗救治更多生命，特别是中国贫困和农村地区的患者',
        action: '放弃美国生活赴华；多年在战乱、贫困地区行医；变卖庄园捐建医院；坚持亲自手术；危急时坚持先救产妇与孩子',
        designConcept: '故事核心人物，象征"跨国大爱""医者仁心"的主题，通过其一生的选择和行动传递无私、平等和人道主义精神'
      },
      {
        id: 'char-patient',
        identity: '高危产妇、受助者',
        desire: '平安生产、保住孩子性命',
        action: '接受手术救治',
        designConcept: '象征普通生命的宝贵性，推动高潮事件发生，并凸显牧琳爱"舍己救人"的价值取向'
      },
      {
        id: 'char-medical-staff',
        identity: '医务人员、同事、见证者',
        desire: '在危急情况下救助同事（牧琳爱）和患者',
        action: '提出抢救牧琳爱；在她指挥下完成手术',
        designConcept: '推动事件冲突（救谁先）并作为观众代入，见证牧琳爱的抉择与精神力量'
      },
      {
        id: 'char-family',
        identity: '家族成员、反对者',
        desire: '保全祖传庄园和家族财富',
        action: '劝阻牧琳爱捐出庄园',
        designConcept: '制造价值观冲突（财富 vs. 生命），衬托主人公无私奉献的选择'
      }
    ],
    events: [
      {
        id: 'event-to-china-1941',
        coreProblem: '是否离开安逸生活去战乱贫困的中国',
        mainObstacle: '家人反对、陌生环境、战乱风险',
        result: '毅然前往中国，从护士做起',
        designConcept: '奠定主人公人生使命的起点，体现理想驱动与跨国关怀'
      },
      {
        id: 'event-naturalize-1950s',
        coreProblem: '长期留在中国还是返回美国',
        mainObstacle: '生活条件艰苦、医疗资源不足',
        result: '加入中国国籍，长期在贫困地区行医',
        designConcept: '深化与中国的情感与文化纽带，形成"第二故乡"的概念'
      },
      {
        id: 'event-donate-hospital-2002',
        coreProblem: '是否舍弃祖传财富建医院',
        mainObstacle: '家族激烈反对、巨大财产损失',
        result: '捐出1,300万元建成聊城国际和平医院',
        designConcept: '体现价值观的极致选择，"财富不如生命贵"主题达到高潮'
      },
      {
        id: 'event-heart-attack-2009',
        coreProblem: '在生命危急时救自己还是救病人',
        mainObstacle: '心梗发作、体力衰竭',
        result: '坚持完成手术救产妇与孩子，自己昏迷送医',
        designConcept: '情节高潮，通过生死抉择凝练人物精神本质'
      },
      {
        id: 'event-legacy-2010',
        coreProblem: '生命的结束与影响的延续',
        mainObstacle: '身体衰竭不可逆',
        result: '在聊城安详离世，医院持续运作，精神被纪念',
        designConcept: '落幕与传承，呼应主题"爱不分国界，生命不分贵贱"'
      }
    ],
    themes: [
      {
        id: 'theme-humanitarianism',
        positiveValue: '将他人生命置于自身利益和安全之上，跨越国籍与文化的关怀',
        negativeValue: '长期的自我牺牲可能导致个人健康与安全受损',
        designConcept: '通过多次舍己救人的情节展现极致人道主义，呼吁对生命平等的尊重'
      },
      {
        id: 'theme-wealth-vs-life',
        positiveValue: '财富的最高意义在于拯救与改善生命',
        negativeValue: '舍弃财富可能带来经济不稳定与亲属矛盾',
        designConcept: '通过变卖庄园的决策突出价值排序，强化"人命重于金钱"的主题'
      },
      {
        id: 'theme-cross-cultural',
        positiveValue: '文化与国籍的差异不会阻碍彼此关怀与认同',
        negativeValue: '跨文化生活可能面临孤立、语言障碍与价值观冲突',
        designConcept: '主人公融入中国社会的历程，强调共同的人性纽带'
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
  draftProjectData: ProjectData | null; // Add draft form data for persistence
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
  setDraftProjectData: (data: ProjectData) => void; // Add draft data setter
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
  draftProjectData: null, // Initialize draft data
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

  const setDraftProjectData = (data: ProjectData) => {
    setOutlineData(prev => ({ ...prev, draftProjectData: data }));
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
    setOutlineData(prev => ({
      ...initialOutlineData,
      draftProjectData: prev.draftProjectData // Preserve draft form data
    }));
  };

  const hasValidOutlineData = () => {
    return !!(outlineData.formData && outlineData.outlineText.trim());
  };

  const value: OutlineContextType = {
    outlineData,
    setFormData,
    setDraftProjectData,
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