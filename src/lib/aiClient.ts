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

// Determine the API endpoint based on environment
const getApiEndpoint = (path: string): string => {
  // Explicit override (useful for calling a separate API host)
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) return `${apiUrl}/api/${path}`;

  // Always use /api/ route (works in both production and development with Vite proxy)
  return `/api/${path}`;
};

// Send chat request through the API
export const sendChatMessage = async (
  messages: ChatMessage[],
  onStream?: (chunk: string) => void
): Promise<AIResponse> => {
  const provider = getAIProvider();
  const endpoint = getApiEndpoint('chat');

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        provider,
        stream: !!onStream
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        return {
          content: '',
          provider,
          error: 'Rate limit exceeded. Please wait a moment and try again.'
        };
      }

      if (response.status === 402) {
        return {
          content: '',
          provider,
          error: 'AI service quota exceeded. Please try again later.'
        };
      }

      return {
        content: '',
        provider,
        error: errorData.error || 'Failed to get AI response. Please check your API keys are configured correctly.'
      };
    }

    const contentType = response.headers.get('content-type') || '';
    const isEventStream = contentType.includes('text/event-stream');

    // Handle streaming response (SSE)
    if (onStream && isEventStream && response.body) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process SSE lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              fullContent += delta;
              onStream(delta);
            }
          } catch {
            // Incomplete JSON, put back in buffer
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      return { content: fullContent, provider: (provider ?? 'openai') as AIProvider };
    }

    // Non-streaming response (JSON)
    const data = await response.json();
    const content = data.content || data.choices?.[0]?.message?.content || '';

    // If caller requested streaming but server returned JSON, emit once
    if (onStream && content) onStream(content);

    return {
      content,
      provider: data.provider || provider,
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
