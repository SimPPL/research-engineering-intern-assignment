import React, { useState, useEffect } from 'react';
import type { ProcessedPost } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp, Users, MessageCircle, Calendar, Activity, Globe } from 'lucide-react';

interface OverviewTabProps {
  data: ProcessedPost[];
}

interface EventCorrelation {
  event: {
    date: string;
    event: string;
    description: string;
  };
  metrics: {
    volume: number;
    negative_sentiment_ratio: number;
    top_topics: { name: string; count: number }[];
  };
}

const COLORS = ['#10b981', '#ef4444', '#9ca3af']; // Positive, Negative, Neutral



const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  const [events, setEvents] = useState<EventCorrelation[]>([]);

  useEffect(() => {
    fetch('/precomputed/event_correlations.json')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error("Failed to load events:", err));
  }, []);

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

  // Key Metrics Calculation
  const stats = React.useMemo(() => {
    const totalPosts = data.length;
    const uniqueAuthors = new Set(data.map(p => p.author)).size;
    
    // Find peak date
    const dateCounts: Record<string, number> = {};
    data.forEach(p => dateCounts[p.date] = (dateCounts[p.date] || 0) + 1);
    const peakDate = Object.entries(dateCounts).sort((a, b) => b[1] - a[1])[0];

    // Dominant Sentiment
    const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    data.forEach(p => sentimentCounts[p.sentiment_label]++);
    const dominantSentiment = Object.entries(sentimentCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalPosts,
      uniqueAuthors,
      peakDate: peakDate ? { date: peakDate[0], count: peakDate[1] } : { date: '-', count: 0 },
      dominantSentiment: dominantSentiment ? { label: dominantSentiment[0], count: dominantSentiment[1] } : { label: '-', count: 0 }
    };
  }, [data]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen font-sans">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
            <MessageCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Posts</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalPosts.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Authors</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.uniqueAuthors.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 rounded-lg text-green-600">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Dominant Sentiment</p>
            <h3 className="text-2xl font-bold text-gray-900 capitalize">{stats.dominantSentiment.label}</h3>
            <p className="text-xs text-gray-400">{(stats.dominantSentiment.count / stats.totalPosts * 100).toFixed(1)}% of posts</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Peak Activity</p>
            <h3 className="text-lg font-bold text-gray-900">{stats.peakDate.date}</h3>
            <p className="text-xs text-gray-400">{stats.peakDate.count} posts</p>
          </div>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Propagation Timeline
            </h3>
            <p className="text-sm text-gray-500 mt-1">Daily post volume over time with key events marked</p>
          </div>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(str) => format(new Date(str), 'MMM d')}
                tick={{fontSize: 12, fill: '#9ca3af'}}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#9ca3af'}}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                cursor={{stroke: '#e5e7eb', strokeWidth: 2}}
              />
              {events.map((evt, idx) => (
                <ReferenceLine 
                  key={idx} 
                  x={evt.event.date} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: '📢', 
                    position: 'top',
                    fill: '#ef4444',
                    fontSize: 16
                  }}
                />
              ))}
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={false}
                activeDot={{r: 8, fill: '#4f46e5', stroke: '#fff', strokeWidth: 4}} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Context Cards */}
        {events.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-500 mb-4 flex items-center gap-2">
              <Globe size={16} />
              Real-World Context (Correlated Events)
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {events.map((evt, idx) => (
                <div key={idx} className="min-w-[280px] bg-gray-50 p-4 rounded-lg border-l-4 border-red-500 hover:shadow-md transition-shadow">
                  <div className="font-bold text-gray-900 text-sm">{evt.event.date}</div>
                  <div className="text-red-600 font-semibold text-sm mb-2">{evt.event.event}</div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{evt.event.description}</p>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span className="bg-white px-2 py-1 rounded border border-gray-200">📊 Vol: {evt.metrics.volume}</span>
                    <span className="bg-white px-2 py-1 rounded border border-gray-200">😡 Neg: {(evt.metrics.negative_sentiment_ratio * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Sentiment Split</h3>
          <div className="h-64">
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

        {/* Top Authors */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Active Accounts</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topAuthors} margin={{left: 0, right: 0}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{fontSize: 11, fill: '#6b7280'}}
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
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topDomains} margin={{left: 0, right: 0}}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100}
                  tick={{fontSize: 11, fill: '#6b7280'}}
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
