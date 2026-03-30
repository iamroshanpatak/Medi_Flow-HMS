// frontend/components/health/AdvancedChatBot.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  metadata?: {
    level?: string;
    action?: string;
    suggestions?: string[];
    departments?: string[];
  };
}

export default function AdvancedChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m MediFlow AI Assistant. I\'m here to help you understand your health symptoms, answer medical questions, and provide personalized health guidance. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/nlp/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: inputValue,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response.message,
        timestamp: new Date(),
        metadata: {
          level: data.response.level,
          action: data.response.action,
          suggestions: data.response.suggestions,
          departments: data.response.departmentRecommendations
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getMessageStyle = (role: string, level?: string) => {
    if (role === 'user') {
      return 'bg-blue-600 text-white';
    }
    
    switch (level) {
      case 'emergency': return 'bg-red-100 border-l-4 border-red-500 text-gray-800';
      case 'medical': return 'bg-orange-100 border-l-4 border-orange-500 text-gray-800';
      case 'caution': return 'bg-yellow-100 border-l-4 border-yellow-500 text-gray-800';
      default: return 'bg-gray-100 text-gray-800 border-l-4 border-blue-500';
    }
  };

  const getLevelIcon = (level?: string) => {
    switch (level) {
      case 'emergency': return '🚨';
      case 'medical': return '⚕️';
      case 'caution': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const quickQuestions = [
    'What should I do about my headache?',
    'I have chest pain. Is it serious?',
    'How do I schedule an appointment?',
    'What are the symptoms of cold vs flu?'
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold">
            AI
          </div>
          <div>
            <h1 className="text-lg font-bold">MediFlow AI Assistant</h1>
            <p className="text-xs text-blue-100">Powered by Advanced NLP</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${getMessageStyle(
                message.role,
                message.metadata?.level
              )}`}
            >
              <div className="flex items-start gap-2">
                {message.role === 'assistant' && (
                  <span className="text-lg flex-shrink-0">{getLevelIcon(message.metadata?.level)}</span>
                )}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  
                  {/* Metadata */}
                  {message.metadata && message.role === 'assistant' && (
                    <div className="mt-3 pt-3 border-t border-opacity-30 border-gray-400 space-y-2">
                      {message.metadata.departments && message.metadata.departments.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold opacity-80 mb-1">Recommended Departments:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.metadata.departments.slice(0, 2).map((dept, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 bg-white bg-opacity-30 rounded text-xs">
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {message.metadata.suggestions && message.metadata.suggestions.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold opacity-80 mb-1">Next Steps:</p>
                          <ul className="text-xs space-y-1">
                            {message.metadata.suggestions.slice(0, 2).map((sugg, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span>▸</span>
                                <span>{sugg}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs opacity-60 mt-2">
                    {message.timestamp?.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions - Only show when no conversation has started */}
      {messages.length === 1 && !loading && (
        <div className="px-4 py-3 bg-white border-t">
          <p className="text-xs text-gray-600 font-semibold mb-2">Quick Questions:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputValue(question);
                }}
                className="text-left text-xs p-2 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t p-4 shadow-lg">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe your symptoms or ask a health question..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? '⏳' : '▶'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Be specific about your symptoms for better health guidance
        </p>
      </div>

      {/* Chat Actions Bar */}
      <div className="bg-gray-100 border-t px-4 py-2 flex gap-2 text-xs">
        <button className="px-3 py-1 bg-white rounded hover:bg-gray-50 border border-gray-300">
          📋 FAQ
        </button>
        <button className="px-3 py-1 bg-white rounded hover:bg-gray-50 border border-gray-300">
          🔄 Clear Chat
        </button>
        <button className="px-3 py-1 bg-white rounded hover:bg-gray-50 border border-gray-300">
          📄 Export
        </button>
      </div>
    </div>
  );
}
