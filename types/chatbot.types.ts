// types/chatbot.types.ts

export interface IChatbotQA {
  _id: string;
  question: string;
  answer: string; // HTML from Jodit
  category: string;
  is_visible: boolean;
  sort_order: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface IChatbotConfig {
  _id: string;
  is_enabled: boolean;
  bot_name: string;
  welcome_message: string;
  fallback_message: string;
  primary_color: string;
  position: "bottom-right" | "bottom-left";
  avatar_icon: string; // emoji or icon name
  show_branding: boolean;
  created_at: string;
  updated_at: string;
}

export interface IChatbotStats {
  total_questions: number;
  visible_questions: number;
  total_sessions: number;
  top_questions: { question: string; click_count: number }[];
}

export interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  isHtml?: boolean;
  timestamp: Date;
}

export interface CreateQAPayload {
  question: string;
  answer: string;
  category: string;
  is_visible: boolean;
  sort_order: number;
}

export interface UpdateQAPayload extends Partial<CreateQAPayload> {}

export interface UpdateConfigPayload extends Partial<Omit<IChatbotConfig, "_id" | "created_at" | "updated_at">> {}