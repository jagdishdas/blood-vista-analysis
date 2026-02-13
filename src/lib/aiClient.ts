import { supabase } from '@/integrations/supabase/client';
// Provider-agnostic AI Client abstraction layer
// Supports multiple AI providers configured via environment variables

export type AIProvider = 'openai' | 'gemini' | 'claude';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  provider?: AIProvider;
  error?: string;
}

// Get the configured AI provider from environment (optional - backend auto-detects)
export const getAIProvider = (): AIProvider | undefined => {
  const provider = import.meta.env.VITE_AI_PROVIDER?.toLowerCase();
  if (provider && ['openai', 'gemini', 'claude'].includes(provider)) {
    return provider as AIProvider;
  }
  return undefined; // Let backend auto-detect based on available API keys
};



// Send chat request through Supabase Edge Function
export const sendChatMessage = async (
  messages: ChatMessage[],
  onStream?: (chunk: string) => void
): Promise<AIResponse> => {
  const provider = getAIProvider();

  try {
    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('bloodvista-chat', {
      body: {
        messages,
        provider,
        stream: !!onStream
      }
    });

    if (error) {
      console.error('Supabase function error:', error);

      // Handle specific error types
      if (error.message?.includes('rate limit')) {
        return {
          content: '',
          provider,
          error: 'Rate limit exceeded. Please wait a moment and try again.'
        };
      }

      if (error.message?.includes('quota')) {
        return {
          content: '',
          provider,
          error: 'AI service quota exceeded. Please try again later.'
        };
      }

      return {
        content: '',
        provider,
        error: error.message || 'Failed to get AI response. Please check your Supabase configuration.'
      };
    }

    // Handle successful response
    const content = data?.content || '';

    // If caller requested streaming, emit the full content once
    // Note: Supabase functions don't support true streaming yet
    if (onStream && content) {
      onStream(content);
    }

    return {
      content,
      provider: data?.provider || provider,
    };
  } catch (error) {
    console.error('AI Client error:', error);
    return {
      content: '',
      provider,
      error: error instanceof Error ? error.message : 'Network error. Please check your internet connection and try again.'
    };
  }
};

// Chat history management (localStorage)
const CHAT_HISTORY_KEY = 'bloodvista_chat_history';
const MAX_HISTORY_LENGTH = 50;

export interface StoredMessage extends ChatMessage {
  id: string;
  timestamp: number;
}

export const getChatHistory = (): StoredMessage[] => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const saveChatHistory = (messages: StoredMessage[]): void => {
  try {
    // Keep only the last MAX_HISTORY_LENGTH messages
    const trimmed = messages.slice(-MAX_HISTORY_LENGTH);
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

export const clearChatHistory = (): void => {
  try {
    localStorage.removeItem(CHAT_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
};

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
