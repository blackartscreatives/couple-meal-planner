
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, DietPreference } from '../types';
import { getAiResponse } from '../services/geminiService';
import { PaperAirplaneIcon, SparklesIcon, XIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface AiAssistantProps {
  onClose: () => void;
  dietPreference: DietPreference;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ onClose, dietPreference }) => {
  const [conversation, setConversation] = useState<Conversation[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [conversation]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Conversation = { role: 'user', text: input };
    setConversation((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const modelResponseText = await getAiResponse(input, dietPreference);
    const modelMessage: Conversation = { role: 'model', text: modelResponseText };

    setConversation((prev) => [...prev, modelMessage]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-stone-100 rounded-lg shadow-lg">
      <div className="flex items-center justify-between p-4 bg-teal-600 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <SparklesIcon className="w-6 h-6" />
          <h2 className="text-xl font-bold">AI Assistant</h2>
        </div>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-teal-700 transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
            <div className="flex justify-start">
                <div className="bg-teal-100 text-teal-900 p-3 rounded-lg max-w-xs md:max-w-md shadow">
                    <p>Hello! How can I help with your meal planning today? Ask me for Sri Lankan recipes, fusion ideas, or weekly meal plans!</p>
                </div>
            </div>
          {conversation.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'} p-3 rounded-lg max-w-xs md:max-w-md shadow`}>
                {msg.role === 'model' 
                  ? <MarkdownRenderer content={msg.text} />
                  : <p>{msg.text}</p>
                }
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 p-3 rounded-lg max-w-xs md:max-w-md shadow">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-stone-200 bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for a recipe..."
            className="flex-1 p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-teal-600 text-white rounded-lg disabled:bg-stone-300 hover:bg-teal-700 transition-colors"
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};