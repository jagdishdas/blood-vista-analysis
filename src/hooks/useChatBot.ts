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

  // Use ref to track loading state and prevent race conditions
  const isLoadingRef = useRef(false);
  const processingRef = useRef(false);

  // Sync ref with state
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

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
    const trimmedContent = content.trim();

    // Prevent sending if empty, already loading, or already processing
    if (!trimmedContent || isLoadingRef.current || processingRef.current) {
      return;
    }

    // Set processing flag to prevent duplicate sends
    processingRef.current = true;

    // Clear any previous errors when sending new message
    setError(null);
    setIsLoading(true);

    try {
      // Create user message
      const userMessage: StoredMessage = {
        id: generateMessageId(),
        role: 'user',
        content: trimmedContent,
        timestamp: Date.now()
      };

      // Prepare API messages BEFORE adding any new messages
      // Get current message history and add the new user message
      const apiMessages: ChatMessage[] = [...messages, userMessage].map(({ role, content }) => ({ role, content }));


      // Add user message to UI
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Create assistant placeholder
      const assistantId = generateMessageId();
      const assistantMessage: StoredMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now()
      };

      // Add assistant placeholder to UI
      setMessages(prevMessages => [...prevMessages, assistantMessage]);

      // Track streamed content
      let streamedContent = '';

      // Send to API with streaming callback
      const response = await sendChatMessage(apiMessages, (chunk) => {
        streamedContent += chunk;
        // Update assistant message with streamed content
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: streamedContent }
              : msg
          )
        );
      });

      // Handle response
      if (response.error) {
        setError(response.error);
        // Remove the assistant placeholder on error
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== assistantId));
      } else if (!streamedContent && response.content) {
        // Non-streaming response - update the placeholder with full content
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === assistantId
              ? { ...msg, content: response.content }
              : msg
          )
        );
      } else if (!streamedContent && !response.content) {
        // No content received at all - remove placeholder and show error
        setError('No response received from AI. Please try again.');
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== assistantId));
      }
      // If streamedContent exists, the message was already updated during streaming
    } catch (err) {
      console.error('Send message error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Remove any empty assistant messages on error
      setMessages(prevMessages =>
        prevMessages.filter(msg => !(msg.role === 'assistant' && !msg.content))
      );
    } finally {
      setIsLoading(false);
      processingRef.current = false;
    }
  }, []); // Empty dependencies - uses refs and functional updates

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
