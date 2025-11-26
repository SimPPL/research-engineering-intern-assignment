import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import SemanticMap from './SemanticMap';

interface NarrativeTabProps {
  // data: ProcessedPost[]; // Removed unused prop
}

interface TopicWord {
  term: string;
  weight: number;
}

interface Topic {
  id: number;
  name: string;
  words: TopicWord[];
}

interface PrecomputedTopics {
  topics: Topic[];
  evolution: Array<Record<string, any>>;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #f3f4f6'
};

const NarrativeTab: React.FC<NarrativeTabProps> = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicData, setTopicData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrecomputedTopics();
  }, []);

  const loadPrecomputedTopics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/precomputed/topics.json');
      
      if (!response.ok) {
        throw new Error('Pre-computed topics not found. Please run the Python script first.');
      }
      
      const precomputed: PrecomputedTopics = await response.json();
      
      if (!precomputed.topics || precomputed.topics.length === 0) {
        throw new Error('Pre-computed file is empty');
      }
      
      setTopics(precomputed.topics);
      setTopicData(precomputed.evolution || []);
      console.log('Loaded pre-computed topics:', precomputed.topics.length, 'topics');
    } catch (err) {
      console.error('Failed to load pre-computed topics:', err);
      setError(
        'Pre-computed topics not found. Please run the Python script first.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#ff6b6b', '#4ecdc4', '#45b7d1'];

  if (isLoading) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #e5e7eb',
          borderTopColor: '#4f46e5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p style={{ color: '#6b7280' }}>Loading pre-computed topics...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
        <div style={{ 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          padding: '24px',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <h3 style={{ color: '#dc2626', fontSize: '18px', marginBottom: '16px' }}>
            ⚠️ Pre-computed Data Not Found
          </h3>
          <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>
            {error}
          </p>
          <div style={{ 
            backgroundColor: '#1f2937', 
            color: '#10b981', 
            padding: '16px', 
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '14px',
            textAlign: 'left'
          }}>
            <p style={{ margin: '0 0 8px 0', color: '#9ca3af' }}># Run these commands in terminal:</p>
            <p style={{ margin: '0 0 4px 0' }}>cd my-data-ui/scripts</p>
            <p style={{ margin: '0 0 4px 0' }}>pip install scikit-learn vaderSentiment</p>
            <p style={{ margin: 0 }}>python precompute_analysis.py</p>
          </div>
          <button 
            onClick={loadPrecomputedTopics}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🔄 Retry Loading
          </button>
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
        <p style={{ color: '#6b7280' }}>No topics found in pre-computed data.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Semantic Map Visualization */}
      <SemanticMap />

      <div style={cardStyle}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
          🧬 Topic Modeling (LDA)
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
          {topics.length} topics discovered from your data using Latent Dirichlet Allocation.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${Math.min(topics.length, 5)}, 1fr)`, 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          {topics.map((topic, idx) => (
            <div 
              key={topic.id} 
              style={{ 
                backgroundColor: '#eff6ff', 
                padding: '16px', 
                borderRadius: '8px', 
                border: '1px solid #dbeafe',
                borderLeft: `4px solid ${COLORS[idx % COLORS.length]}`
              }}
            >
              <h4 style={{ 
                fontWeight: 'bold', 
                color: '#1e40af', 
                marginBottom: '12px', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  backgroundColor: COLORS[idx % COLORS.length],
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {idx + 1}
                </span>
                {topic.name}
              </h4>
              <ul style={{ fontSize: '13px', color: '#3b82f6', listStyle: 'none', padding: 0, margin: 0 }}>
                {topic.words.slice(0, 8).map((word, i) => (
                  <li key={i} style={{ 
                    marginBottom: '4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{word.term}</span>
                    <span style={{ 
                      fontSize: '11px', 
                      color: '#9ca3af',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {(word.weight / 100).toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {topicData.length > 0 && (
          <>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              🌊 Narrative Stream: Topics over Time
            </h3>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={topicData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(str) => {
                      try {
                        return format(new Date(str), 'MMM d');
                      } catch {
                        return str;
                      }
                    }}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  {topics.map((topic, idx) => (
                    <Area 
                      key={topic.id}
                      type="monotone" 
                      dataKey={topic.name}
                      stackId="1" 
                      stroke={COLORS[idx % COLORS.length]} 
                      fill={COLORS[idx % COLORS.length]}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NarrativeTab;
