import React, { useState, useRef, useEffect } from 'react';
import type { ProcessedPost } from '../types';
import { Send, Bot, User } from 'lucide-react';

interface CopilotTabProps {
  data: ProcessedPost[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #f3f4f6',
  height: '600px',
  display: 'flex',
  flexDirection: 'column'
};

const CopilotTab: React.FC<CopilotTabProps> = ({ data }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Simple Intent Logic
    const prompt = input.toLowerCase();
    let response: string;

    if (prompt.includes('author') || prompt.includes('user')) {
      const counts: Record<string, number> = {};
      data.forEach(p => {
        if (p.author && p.author !== '[deleted]') counts[p.author] = (counts[p.author] || 0) + 1;
      });
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      response = "**Top Active Authors:**\n" + top.map(([k, v]) => `- ${k}: ${v} posts`).join('\n');
    } else if (prompt.includes('sentiment')) {
      const counts = { Positive: 0, Negative: 0, Neutral: 0 };
      data.forEach(p => counts[p.sentiment_label]++);
      const total = data.length;
      response = `**Sentiment Overview:**\n- Positive: ${((counts.Positive / total) * 100).toFixed(1)}%\n- Negative: ${((counts.Negative / total) * 100).toFixed(1)}%\n- Neutral: ${((counts.Neutral / total) * 100).toFixed(1)}%`;
    } else if (prompt.includes('trend') || prompt.includes('time')) {
      const counts: Record<string, number> = {};
      data.forEach(p => counts[p.date] = (counts[p.date] || 0) + 1);
      const peakDate = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      response = `Activity peaked on **${peakDate}**. Check the 'Overview' tab for the full timeline.`;
    } else if (prompt.includes('summary')) {
      const uniqueAuthors = new Set(data.map(p => p.author)).size;
      const topDomains = new Set(data.map(p => p.domain)).size;
      response = `**Executive Summary:**\nAnalyzing ${data.length} posts. The conversation is driven by ${uniqueAuthors} unique authors. Major themes involve ${topDomains} external sources.`;
    } else if (prompt.includes('news') || prompt.includes('spread') || prompt.includes('what')) {
      const topDomains = Object.entries(
        data.reduce((acc, p) => {
          if (p.domain && p.domain !== 'self') acc[p.domain] = (acc[p.domain] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).sort((a, b) => b[1] - a[1]).slice(0, 3);
      response = `**News Analysis:**\nThe most discussed topics are from:\n${topDomains.map(([domain, count]) => `- ${domain}: ${count} mentions`).join('\n')}\n\nCheck the 'Network' tab for interaction patterns.`;
    } else {
      response = "I can help you analyze authors, sentiment, trends, or provide a summary. Try asking 'Who are the top authors?' or 'What news is being spread?'";
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <div style={cardStyle}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>🤖 Analyst Copilot</h3>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Ask questions about the data.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f9fafb', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '80px' }}>
            <Bot style={{ width: '48px', height: '48px', margin: '0 auto 8px', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>Ask me anything about the dataset!</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Try: "Who are the top authors?", "Show me sentiment trends"</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ 
              maxWidth: '80%', 
              borderRadius: '8px', 
              padding: '12px',
              backgroundColor: msg.role === 'user' ? '#4f46e5' : 'white',
              color: msg.role === 'user' ? 'white' : '#1f2937',
              border: msg.role === 'user' ? 'none' : '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px', opacity: 0.7, fontSize: '12px' }}>
                {msg.role === 'user' ? <User style={{ width: '12px', height: '12px', marginRight: '4px' }} /> : <Bot style={{ width: '12px', height: '12px', marginRight: '4px' }} />}
                <span style={{ textTransform: 'capitalize' }}>{msg.role}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '14px' }}>{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '16px', backgroundColor: 'white', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the copilot..."
            style={{ 
              flex: 1, 
              border: '1px solid #d1d5db', 
              borderRadius: '8px', 
              padding: '8px 16px',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={handleSend}
            style={{ 
              backgroundColor: '#4f46e5', 
              color: 'white', 
              padding: '8px', 
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopilotTab;
