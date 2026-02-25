import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, X, Calendar, Info, Handshake } from 'lucide-react';
import { getChatResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! Welcome to EVERGREENS 😊 How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', text: messageText }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getChatResponse(messageText, history);
    setMessages([...newMessages, { role: 'model', text: response || '' }]);
    setIsLoading(false);
  };

  const quickActions = [
    { label: 'Learn More', icon: Info, action: 'Tell me more about EVERGREENS.' },
    { label: 'Collaborate', icon: Handshake, action: 'I want to discuss a collaboration.' },
    { label: 'Schedule Meeting', icon: Calendar, action: 'I want to schedule a meeting.' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-forest text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-50"
      >
        <Bot size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] glass-card flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 bg-forest text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={20} />
                <span className="font-medium">EVERGREENS Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:opacity-70">
                <X size={20} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' ? 'bg-sage text-white rounded-tr-none' : 'bg-beige text-charcoal rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-beige p-3 rounded-2xl rounded-tl-none">
                    <motion.div
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex gap-1"
                    >
                      <div className="w-1.5 h-1.5 bg-sage rounded-full" />
                      <div className="w-1.5 h-1.5 bg-sage rounded-full" />
                      <div className="w-1.5 h-1.5 bg-sage rounded-full" />
                    </motion.div>
                  </div>
                </div>
              )}
            </div>

            {messages.length < 3 && (
              <div className="p-4 border-t border-sage/10 flex gap-2 overflow-x-auto">
                {quickActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(action.action)}
                    className="flex items-center gap-1 whitespace-nowrap px-3 py-1.5 bg-sage/10 text-forest text-xs rounded-full hover:bg-sage/20 transition-colors"
                  >
                    <action.icon size={14} />
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-4 border-t border-sage/10 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-beige/50 border-none rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-sage"
              />
              <button type="submit" className="text-forest hover:scale-110 transition-transform">
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
