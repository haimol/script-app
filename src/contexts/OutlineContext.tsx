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

// Helper function to create empty project data structure with Charles Lightoller's story
export const createEmptyProjectData = (): ProjectData => {
  return {
    storySynopsis: "这是一个历史传记片，主人翁查尔斯·莱托勒，一个经历过四次海难、两次世界大战的英雄故事。查尔斯·莱托勒幼年丧父丧母，父亲弃他而去。他孤苦伶仃，后来参加了水手班的学习，13岁出海。在英国和南非作战的时候，他作为海军战士到了澳大利亚。在海军的成长中，他意识到了自己的责任。泰坦尼克号出海的时候，他是这艘船上的二副。在泰坦尼克撞到冰山时，他提醒船长和大副，这是一个不同的海难，希望早做准备。但是，船长和大副都认为这是一艘不可沉没的船。在船即将沉没的时候，查尔斯·莱托勒用空手枪维护船上的秩序，下令妇女和儿童先上船。船沉没之后，他逃上了一艘救生艇，又指挥全艇的人保持平衡，最终得救。后来他离开泰坦尼克号之后，又回到英国从事各种事业的创业，但屡不得志。就和妻子结婚，回到了小镇上过平凡人的生活，并生了两个孩子。他的第二个孩子，二儿子，在二战爆发的第三天，作为一个空军战士战死在空中。查尔斯·莱托勒在敦刻尔克大撤退的时候，作为一个普通的船长，驾着自己家的小船参加了敦刻尔克大撤退。他带着他的儿子一起完成了不可能的任务。后来他的大儿子也参加了英国皇家部队，在二战即将结束的前一个月，他的大儿子也战死疆场。莱托勒最终孤老一生，在他临终去世的时候，又经历了1952年的伦敦毒雾事件，他是此事件中近4000名死亡者中的一员。英雄不死的故事到此戛然而止。我们这个片子希望以倒叙的方式来呈现英雄的一生。开头从查尔斯·莱托勒带着自己的孩子参加敦刻尔克大撤退，驶向法国方向。在平静的海面上，他内心波涛汹涌，闪回着他成长当中每一个难忘的瞬间。敦刻尔克大撤退完成之后，他毅然把自己的孩子送上了战场。片子的尾声是伦敦毒雾事件中，莱托勒在自己的家中忍受着剧烈的咳嗽，回想着自己的一生。然后他的妻子问他：'假如让你再次选择，你将会怎样？'",
    characters: [
      {
        id: 'char-lightoller',
        identity: '英国海军军官、泰坦尼克号二副、民船船长',
        desire: '履行职责、保护他人生命、维护家庭责任与荣誉',
        action: '在危机时刻组织救援、维持秩序、坚守职业道德直至最后',
        designConcept: '一个从孤儿成长为英雄的人物弧线，体现职业精神与家庭责任的冲突。通过多次灾难展现角色的成长与牺牲精神，最终形成完整的英雄形象。'
      },
      {
        id: 'char-wife',
        identity: '查尔斯的妻子、家庭主妇、支持者',
        desire: '维系家庭和睦、保护孩子安全、理解丈夫的选择',
        action: '默默支持丈夫的事业、照顾家庭、在关键时刻给予情感支撑',
        designConcept: '代表家庭温暖与现实关怀的角色，在英雄叙事中提供情感支点和价值观对比。通过她的视角反映战争对普通家庭的影响。'
      },
      {
        id: 'char-sons',
        identity: '查尔斯的两个儿子、英国皇家空军/陆军士兵',
        desire: '为国家服务、继承父亲的荣誉传统、证明自己的勇气',
        action: '参军入伍、在战场上英勇作战、为国捐躯',
        designConcept: '代表新一代的牺牲与传承，体现家族荣誉的延续。他们的死亡是父亲英雄之路的代价，强化悲剧色彩和反战思考。'
      }
    ],
    events: [
      {
        id: 'event-titanic',
        coreProblem: '泰坦尼克号撞击冰山，面临沉船危机，船长和大副拒绝承认危险',
        mainObstacle: '救生艇数量不足、乘客恐慌、上级不听从专业建议',
        result: '成功组织妇女儿童优先撤离，自己获救但承受心理创伤',
        designConcept: '核心灾难事件，确立主角的英雄品质和职业操守。通过与权威的冲突展现个人判断与体制的矛盾，为后续情节奠定基础。'
      },
      {
        id: 'event-dunkirk',
        coreProblem: '敦刻尔克大撤退，英军被困海滩，需要民船救援',
        mainObstacle: '敌军轰炸、海况恶劣、时间紧迫、个人安全与责任冲突',
        result: '成功参与撤退行动，完成不可能的任务，但内心承受更大压力',
        designConcept: '英雄的再次选择时刻，体现从职业责任到个人选择的升华。父子同行增加情感重量，预示后续的家庭悲剧。'
      },
      {
        id: 'event-sons-death',
        coreProblem: '两个儿子在二战中相继阵亡，家庭承受巨大打击',
        mainObstacle: '无法改变战争现实、个人力量的渺小、家庭责任与国家责任的冲突',
        result: '失去所有儿子，晚年孤独，但坚持了自己的价值观',
        designConcept: '英雄的最大代价，通过家庭悲剧反思战争与责任的意义。为影片的哲学思辨提供情感支撑，引发观众对英雄主义代价的思考。'
      }
    ],
    themes: [
      {
        id: 'theme-duty-vs-family',
        positiveValue: '职业操守、救人精神、为他人牺牲的崇高品质',
        negativeValue: '个人英雄主义的代价、家庭幸福的丧失、孤独终老',
        designConcept: '探讨职责与家庭的平衡问题，英雄主义的双面性。通过主角一生的选择展现理想与现实的冲突，引发对责任与幸福关系的思考。'
      },
      {
        id: 'theme-war-sacrifice',
        positiveValue: '为国家和他人服务的荣誉感、传承家族精神、历史责任',
        negativeValue: '战争的残酷性、无谓的牺牲、家庭破碎的痛苦',
        designConcept: '通过多代人的战争经历反思战争的意义，质疑盲目的英雄主义。展现战争对普通家庭的毁灭性影响，呼吁和平与理性。'
      },
      {
        id: 'theme-choice-regret',
        positiveValue: '坚持信念、无悔选择、道德勇气、历史见证',
        negativeValue: '错过的幸福、无法挽回的损失、孤独的承担、命运的无常',
        designConcept: '通过妻子最后的提问探讨人生选择的意义。在生命终点回望一生，思考是否值得，为观众提供深层的人生哲学思辨。'
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