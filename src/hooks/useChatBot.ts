import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  sendChatMessage, 
  getChatHistory, 
  saveChatHistory, 
  clearChatHistory,
  generateMessageId,
  type ChatMessage,
  type StoredMessage 
} from '@/lib/aiClient';
import { appConfig } from '@/lib/appConfig';

export const useChatBot = () => {
  const [messages, setMessages] = useState<StoredMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load chat history on mount
  useEffect(() => {
    const history = getChatHistory();
    if (history.length > 0) {
      setMessages(history);
    }
  }, []);

  // Save chat history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    setError(null);
    
    // Add user message
    const userMessage: StoredMessage = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Prepare messages for API (convert StoredMessage to ChatMessage)
    const apiMessages: ChatMessage[] = messages
      .concat(userMessage)
      .map(({ role, content }) => ({ role, content }));

    try {
      let assistantContent = '';
      const assistantId = generateMessageId();
      
      // Create placeholder for streaming
      const assistantMessage: StoredMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      const response = await sendChatMessage(apiMessages, (chunk) => {
        assistantContent += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantId 
              ? { ...msg, content: assistantContent }
              : msg
          )
        );
      });

      if (response.error) {
        setError(response.error);
        // Remove the empty assistant message on error
        setMessages(prev => prev.filter(msg => msg.id !== assistantId));
      } else if (!assistantContent && response.content) {
        // Non-streaming response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantId 
              ? { ...msg, content: response.content }
              : msg
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    clearChatHistory();
    setError(null);
  }, []);

  const getGreeting = useCallback(() => {
    return appConfig.chatbotGreeting;
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    getGreeting,
    chatbotName: appConfig.chatbotName
  };
};
