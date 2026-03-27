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

    const prompt = input.toLowerCase();
    let response: string = '';

    // Helper: Get top items from an array
    const getTop = (arr: string[], n = 5) => {
      const counts: Record<string, number> = {};
      arr.forEach(x => { if(x) counts[x] = (counts[x] || 0) + 1; });
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
    };

    // 1. Top Sources Query
    if (prompt.includes('top source') || prompt.includes('top website') || prompt.includes('top domain')) {
      const domains = data.map(p => p.domain).filter(d => d && d !== 'self' && d !== 'reddit.com' && d !== 'i.redd.it' && d !== 'v.redd.it');
      const top = getTop(domains as string[], 5);
      response = "**Top External Sources:**\n" + top.map(([d, c]) => `- **${d}**: ${c} mentions`).join('\n');
    }
    
    // 2. Specific Source Query (e.g., "tell me about twitter.com")
    else if (prompt.includes('about source') || prompt.includes('about website') || prompt.includes('analyze domain') || data.some(p => p.domain && prompt.includes(p.domain.toLowerCase()))) {
       const allDomains = Array.from(new Set(data.map(p => p.domain).filter(d => d)));
       const targetDomain = allDomains.find(d => d && prompt.includes(d.toLowerCase()));

       if (targetDomain) {
         const subset = data.filter(p => p.domain === targetDomain);
         const authors = subset.map(p => p.author);
         const topAuthors = getTop(authors, 3);
         const avgScore = (subset.reduce((acc, p) => acc + p.score, 0) / subset.length).toFixed(0);
         
         response = `**Analysis for ${targetDomain}:**\n` +
                    `- **Volume:** ${subset.length} posts\n` +
                    `- **Avg Engagement:** ${avgScore} score\n` +
                    `\n**Top Accounts sharing this source:**\n` +
                    topAuthors.map(([a, c]) => `- ${a} (${c} posts)`).join('\n');
       } else {
         // Fallback if no specific domain matched but intent was there
         response = "I noticed you asked about a source, but I couldn't match it to a specific domain in the dataset. Try asking about 'twitter.com' or 'youtube.com'.";
       }
    }

    // 3. "New and Particular Data" (Search functionality)
    else if (prompt.includes('search') || prompt.includes('find') || prompt.includes('latest') || prompt.includes('about')) {
       const stopWords = ['tell', 'me', 'about', 'find', 'search', 'show', 'latest', 'new', 'data', 'is', 'what', 'the', 'for'];
       const keywords = prompt.split(' ').filter(w => !stopWords.includes(w)).join(' ');
       
       if (keywords.length > 1) {
         const matches = data.filter(p => 
           p.title.toLowerCase().includes(keywords) || 
           p.selftext.toLowerCase().includes(keywords)
         );
         
         if (matches.length > 0) {
           const recent = matches.sort((a, b) => b.created_utc - a.created_utc).slice(0, 3);
           response = `**Found ${matches.length} posts related to "${keywords}":**\n\n` +
                      `**Latest Updates:**\n` +
                      recent.map(p => `- [${p.date}] ${p.title.slice(0, 60)}...`).join('\n');
         } else {
           response = `I searched for "${keywords}" but didn't find any matching posts in the current dataset.`;
         }
       } else {
          response = "What specific topic or keyword would you like me to search for?";
       }
    }

    // 4. Existing Intents (Authors, Sentiment, Trends)
    else if (prompt.includes('author') || prompt.includes('user')) {
      const top = getTop(data.map(p => p.author).filter(a => a !== '[deleted]'), 5);
      response = "**Top Active Authors:**\n" + top.map(([k, v]) => `- ${k}: ${v} posts`).join('\n');
    } 
    else if (prompt.includes('sentiment')) {
      const counts = { Positive: 0, Negative: 0, Neutral: 0 };
      data.forEach(p => { if(p.sentiment_label) counts[p.sentiment_label] = (counts[p.sentiment_label] || 0) + 1 });
      const total = data.length;
      response = `**Sentiment Overview:**\n- Positive: ${((counts.Positive / total) * 100).toFixed(1)}%\n- Negative: ${((counts.Negative / total) * 100).toFixed(1)}%\n- Neutral: ${((counts.Neutral / total) * 100).toFixed(1)}%`;
    }
    else if (prompt.includes('trend') || prompt.includes('time')) {
       const counts: Record<string, number> = {};
       data.forEach(p => counts[p.date] = (counts[p.date] || 0) + 1);
       const peakDate = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
       response = `Activity peaked on **${peakDate}**. Check the 'Overview' tab for the full timeline.`;
    }
    else if (prompt.includes('summary')) {
       const uniqueAuthors = new Set(data.map(p => p.author)).size;
       const uniqueDomains = new Set(data.map(p => p.domain)).size;
       response = `**Executive Summary:**\nAnalyzing ${data.length} posts. The conversation is driven by ${uniqueAuthors} unique authors. Major themes involve ${uniqueDomains} external sources.`;
    }
    else {
      response = "I can help you analyze sources, authors, sentiment, or specific topics. Try asking:\n- 'What are the top sources?'\n- 'Tell me about twitter.com'\n- 'Find posts about election'";
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <div style={cardStyle}>
      <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>🤖 Analyst AI</h3>
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
            placeholder="Ask AI..."
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
