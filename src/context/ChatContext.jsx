import { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load chat history from sessionStorage if available to persist refresh
  useEffect(() => {
    const savedHistory = sessionStorage.getItem('walletwiz_chat_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to restore chat history', e);
      }
    }
  }, []);

  const saveHistory = (newHistory) => {
    setHistory(newHistory);
    sessionStorage.setItem('walletwiz_chat_history', JSON.stringify(newHistory));
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    setError('');
    setLoading(true);

    const userMessage = { role: 'user', content: messageText };
    const updatedHistory = [...history, userMessage];
    saveHistory(updatedHistory);

    try {
      // Filter history for the API to avoid sending non-standard fields like metadata
      const apiHistory = updatedHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await api.post('/chat', {
        message: messageText,
        history: apiHistory,
      });

      const assistantMessage = {
        role: 'assistant',
        content: response.data.response,
        tool_triggered: response.data.tool_triggered,
        metadata: response.data.metadata,
      };

      saveHistory([...updatedHistory, assistantMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      // Let 429 be handled by the global axios interceptor event, other errors locally
      if (err.response?.status !== 429) {
        setError(err.response?.data?.detail || 'Failed to connect to the assistant.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    sessionStorage.removeItem('walletwiz_chat_history');
    setError('');
  };

  const value = {
    history,
    loading,
    error,
    sendMessage,
    clearHistory,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
