import React, { useState, useEffect, useRef } from 'react';

interface CopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  type?: 'text' | 'action' | 'data';
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'agent', text: 'Hello, Commander. I am AquaRisk Copilot. How can I assist you with Plant 01 today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('http://localhost:8000/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      
      const data = await res.json();
      
      const agentMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        sender: 'agent', 
        text: data.response,
        type: data.type 
      };
      
      setMessages(prev => [...prev, agentMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'agent', text: 'Error connecting to intelligence core.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-96 bg-surface-subtle border-l border-surface-border shadow-2xl transition-transform duration-300 z-50 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-surface-border bg-surface-card">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">auto_awesome</span>
          <div>
            <h2 className="text-headline-md font-bold text-text-main">AquaRisk Copilot</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-status-operational animate-pulse"></span>
              <span className="text-label-sm uppercase font-semibold text-status-operational">Intelligence Online</span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors p-1 rounded-full hover:bg-surface-elevated">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-background">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-body-md ${
              msg.sender === 'user' 
                ? 'bg-primary text-background font-medium' 
                : 'bg-surface-elevated border border-surface-border text-text-main'
            }`}>
              {msg.type === 'action' && <div className="text-[10px] font-bold text-primary font-mono mb-1 uppercase tracking-wider">⚡ ACTION REQUIRED</div>}
              {msg.type === 'data' && <div className="text-[10px] font-bold text-status-info font-mono mb-1 uppercase tracking-wider">📊 DATA RETRIEVAL</div>}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface-elevated border border-surface-border rounded-lg p-3 px-4">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-surface-border bg-surface-card flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Copilot about telemetry or risk..."
            className="flex-1 bg-background border border-surface-border rounded px-3 py-2 text-body-sm text-text-main placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="bg-primary hover:bg-primary-hover text-background p-2 rounded disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">send</span>
          </button>
        </div>
        <div className="text-center text-label-sm text-text-muted">
          Copilot can analyze telemetry, suggest actions, and execute isolations.
        </div>
      </div>
    </div>
  );
};
