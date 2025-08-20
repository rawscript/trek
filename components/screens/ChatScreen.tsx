import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { streamChatMessage } from '../../services/geminiService';
import { useAuth } from '../../hooks/useAuth';
import { ChatMessage } from '../../types';
import Loader from '../ui/Loader';
import ErrorDisplay from '../ui/ErrorDisplay';
import { features, logger } from '../../config/env';

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  
  // Check if AI is available and set initial message accordingly
  const getInitialMessage = (): ChatMessage => {
    if (!features.isAIAvailable()) {
      return {
        role: 'model',
        text: `Hi ${user?.name}! 👋 I'm currently offline, but I'd love to help you plan your adventures! To enable AI chat, please add your Gemini API key to the environment configuration. In the meantime, you can still track your activities and connect with the community! 🚴‍♀️`
      };
    }
    return {
      role: 'model',
      text: `Hi ${user?.name}! How can I help you plan your next adventure today? 🚴‍♀️`
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    // If AI is not available, show a helpful message
    if (!features.isAIAvailable()) {
      setError("AI chat is currently unavailable. Please check your API configuration.");
      return;
    }

    const userMessage: ChatMessage = { role: 'user', text: input };
    const currentInput = input;
    setError(null);
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await streamChatMessage(messages, currentInput);
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      // Handle the streaming response
      if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
        for await (const chunk of stream) {
          if (chunk && chunk.text) {
            const chunkText = chunk.text;
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage && lastMessage.role === 'model') {
                return [...prev.slice(0, -1), { ...lastMessage, text: lastMessage.text + chunkText }];
              }
              return prev;
            });
          }
        }
      } else {
        // Fallback for non-streaming response
        throw new Error("Streaming not supported, falling back to regular response");
      }
    } catch (error: any) {
      logger.error('Error streaming message:', error);
      
      // Remove the empty message we added
      setMessages(prev => prev.filter(msg => msg.text !== ''));
      
      // Try to provide a fallback response
      const fallbackResponses = [
        "I'm having some technical difficulties right now, but I'm here to help! Could you try rephrasing your question?",
        "Sorry, I'm experiencing some connection issues. Let me know what you'd like help with and I'll do my best to assist!",
        "I'm having trouble processing that request right now. Is there something specific about your fitness journey I can help with?",
        "Technical hiccup on my end! Feel free to ask me about route planning, training tips, or anything fitness-related."
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      
      setMessages(prev => [...prev, { role: 'model', text: randomResponse }]);
      setError("I'm having trouble connecting to the AI service. I've provided a fallback response above.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (input.trim()) {
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <h1 className="mb-4 shrink-0 text-3xl font-bold text-brand-dark dark:text-brand-light">AI Planner</h1>
      <div className="flex-1 space-y-4 overflow-y-auto pb-4 pr-2">
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && <img src="https://i.pravatar.cc/150?u=treklyai" alt="AI" className="h-8 w-8 shrink-0 rounded-full" />}
              <div className={`max-w-xs rounded-2xl px-4 py-3 shadow-sm md:max-w-md ${msg.role === 'user' ? 'rounded-br-none bg-brand-dark text-white' : 'rounded-bl-none bg-gray-100 dark:bg-gray-700 text-brand-dark dark:text-gray-200'}`}>
                {(msg.text === '' && index === messages.length - 1 && isLoading) ? (
                   <Loader />
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
               {msg.role === 'user' && <img src={user?.avatarUrl} alt="User" className="h-8 w-8 shrink-0 rounded-full" />}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      {error && (
        <div className="p-3">
            <ErrorDisplay title="Connection Error" message={error} onRetry={handleRetry} />
        </div>
      )}

      <form onSubmit={handleSend} className="mt-auto shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-brand-dark p-3">
        <div className="flex items-center gap-3">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={features.isAIAvailable() ? "Ask anything..." : "AI chat is currently unavailable"}
                className="w-full flex-1 rounded-full border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 px-5 py-3 text-brand-dark dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green disabled:opacity-50"
                disabled={isLoading || !features.isAIAvailable()}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <motion.button
                type="submit"
                disabled={isLoading || !input.trim() || !features.isAIAvailable()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green text-white shadow-md transition-colors disabled:bg-gray-400 disabled:shadow-none"
                whileHover={!isLoading && input.trim() && features.isAIAvailable() ? { scale: 1.1 } : {}}
                whileTap={!isLoading && input.trim() && features.isAIAvailable() ? { scale: 0.95 } : {}}
                aria-label="Send message"
            >
                <SendIcon />
            </motion.button>
        </div>
      </form>
    </div>
  );
};

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 -rotate-12 transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export default ChatScreen;