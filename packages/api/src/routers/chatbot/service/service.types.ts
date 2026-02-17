import type { User, Request } from "@package/db";

// ==========================================
// Action Types
// ==========================================
export type ActionType =
  | "schedule_meeting"
  | "submit_request"
  | "get_services_info"
  | "get_pricing"
  | "general_info"
  | "escalate_to_human"
  | "none";

export type MessageType = "text" | "interactive";

// ==========================================
// Message Intent Types
// ==========================================
export type MessageIntent =
  | "greeting"
  | "software_inquiry"
  | "marketing_inquiry"
  | "finance_inquiry"
  | "booking_request"
  | "pricing_inquiry"
  | "support_request"
  | "general_info"
  | "unknown";

// ==========================================
// User Context
// ==========================================
export interface UserContext {
  user: User;
  recentRequests: Request[];
}

// ==========================================
// AI Response
// ==========================================
export interface AIResponse {
  messageType: MessageType;
  response: string;
  requiresAction: boolean;
  actionType: ActionType;
  actionData: Record<string, any>;
  nextSteps: string[];
  needsMoreInfo: boolean;
  missingInfo: string[];
}

// ==========================================
// Conversation Context
// ==========================================
export interface ConversationContext {
  userId: string;
  sessionId: string;
  messages: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  currentAction?: ActionType;
  pendingData?: Record<string, any>;
  lastInteraction: string;
}

// ==========================================
// Session Metadata
// ==========================================
export interface SessionMeta {
  shouldGreet: boolean;
  greetingPhrase: "Buenos días" | "Buenas tardes" | "Buenas noches";
  timePeriod: "morning" | "afternoon" | "evening";
  conversationHasHistory: boolean;
  hoursSinceLastGreeting?: number;
}

// ==========================================
// Message Analysis
// ==========================================
export interface MessageAnalysis {
  intent: MessageIntent;
  confidence: number;
  keywords: string[];
  rawText: string;
}

// ==========================================
// AI Attempt (Strategy Result)
// ==========================================
export interface AIAttempt {
  model: string;
  success: boolean;
  response?: string;
  error?: string;
  executionTime: number;
}

// ==========================================
// AI Strategy Interface
// ==========================================
export interface IGenerativeAIStrategy {
  modelName: string;
  weight: number;
  generate(prompt: string): Promise<AIAttempt>;
}

// ==========================================
// Session Statistics
// ==========================================
export interface SessionStats {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  lastInteraction: string;
}

// ==========================================
// Chatbot Configuration
// ==========================================
export interface ChatbotConfig {
  websiteUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappUrl: string;
  maxMessageLength: number;
  sessionTimeout: number;
}

// ==========================================
// Service Response Pattern
// ==========================================
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
