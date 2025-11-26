import React from 'react';
import type { ProcessedPost } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { format } from 'date-fns';

interface OverviewTabProps {
  data: ProcessedPost[];
}

const COLORS = ['#10b981', '#ef4444', '#9ca3af']; // Positive, Negative, Neutral

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #f3f4f6'
};

const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  // Time Series Data
  const timeSeriesData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(p => {
      counts[p.date] = (counts[p.date] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Sentiment Data
  const sentimentData = React.useMemo(() => {
    const counts = { Positive: 0, Negative: 0, Neutral: 0 };
    data.forEach(p => {
      counts[p.sentiment_label]++;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [data]);

  // Top Authors
  const topAuthors = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(p => {
      if (p.author && p.author !== '[deleted]') {
        counts[p.author] = (counts[p.author] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data]);

  // Top Domains
  const topDomains = React.useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(p => {
      if (p.domain && p.domain !== 'self' && p.domain !== 'reddit.com') {
        counts[p.domain] = (counts[p.domain] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Propagation Timeline */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>📈 Propagation Timeline</h3>
          <div style={{ height: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => format(new Date(str), 'MMM d')}
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{fontSize: 12, fill: '#6b7280'}}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#4f46e5" 
                  strokeWidth={3} 
                  dot={{r: 3, fill: '#4f46e5'}} 
                  activeDot={{r: 6}} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Split */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>🎭 Sentiment Split</h3>
          <div style={{ height: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Top Authors */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>🏆 Top Active Accounts</h3>
          <div style={{ height: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topAuthors} margin={{left: 40}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{fontSize: 11, fill: '#4b5563'}}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Domains */}
        <div style={cardStyle}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>🌐 Top External Sources</h3>
          <div style={{ height: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topDomains} margin={{left: 40}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{fontSize: 11, fill: '#4b5563'}}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{fill: '#f9fafb'}} />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
