import React, { useState } from 'react';
import type { ProcessedPost } from '../types';
import OverviewTab from './OverviewTab';
import NarrativeTab from './NarrativeTab';
import NetworkTab from './NetworkTab';
import CopilotTab from './CopilotTab';
import { BarChart2, GitBranch, Share2, MessageSquare } from 'lucide-react';

interface DashboardProps {
  data: ProcessedPost[];
  fullDataLength: number;
}

const Dashboard: React.FC<DashboardProps> = ({ data, fullDataLength }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'narrative' | 'network' | 'copilot'>('overview');

  // KPIs
  const totalPosts = data.length;
  const uniqueAuthors = new Set(data.map(p => p.author)).size;
  const avgSentiment = data.reduce((acc, p) => acc + p.sentiment_score, 0) / totalPosts || 0;
  const viralPosts = data.filter(p => p.score > 1000).length;
  const maxSubscribers = Math.max(...data.map(p => p.subreddit_subscribers || 0));

  return (
    <div style={{ padding: '32px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>🕵️‍♀️ MisinfoOps: Investigative Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '8px', fontStyle: 'italic' }}>Tracking Narratives & Coordinated Behavior</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <KPICard label="Total Posts" value={totalPosts} delta={totalPosts - fullDataLength} />
        <KPICard label="Active Accounts" value={uniqueAuthors} />
        <KPICard label="Avg Sentiment" value={avgSentiment.toFixed(2)} color={avgSentiment > 0 ? '#16a34a' : '#dc2626'} />
        <KPICard label="Viral Posts (>1k)" value={viralPosts} />
        <KPICard label="Subscribers" value={maxSubscribers.toLocaleString()} />
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <nav style={{ display: 'flex', gap: '32px', marginBottom: '-1px' }}>
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<BarChart2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
            label="Overview & Trends" 
          />
          <TabButton 
            active={activeTab === 'narrative'} 
            onClick={() => setActiveTab('narrative')} 
            icon={<GitBranch style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
            label="Narrative Evolution" 
          />
          <TabButton 
            active={activeTab === 'network'} 
            onClick={() => setActiveTab('network')} 
            icon={<Share2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
            label="Network Forensics" 
          />
          <TabButton 
            active={activeTab === 'copilot'} 
            onClick={() => setActiveTab('copilot')} 
            icon={<MessageSquare style={{ width: '16px', height: '16px', marginRight: '8px' }} />}
            label="Analyst Copilot" 
          />
        </nav>
      </div>

      {/* Content */}
      <div style={{ minHeight: '500px' }}>
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'narrative' && <NarrativeTab />}
        {activeTab === 'network' && <NetworkTab data={data} />}
        {activeTab === 'copilot' && <CopilotTab data={data} />}
      </div>
    </div>
  );
};

const KPICard = ({ label, value, delta, color = '#111827' }: { label: string, value: string | number, delta?: number, color?: string }) => (
  <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #f3f4f6' }}>
    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px', margin: 0 }}>{label}</p>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: color, margin: 0 }}>{value}</h3>
      {delta !== undefined && delta !== 0 && (
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '500', 
          padding: '4px 8px', 
          borderRadius: '9999px', 
          backgroundColor: delta > 0 ? '#dcfce7' : '#fee2e2',
          color: delta > 0 ? '#166534' : '#991b1b'
        }}>
          {delta > 0 ? '+' : ''}{delta}
        </span>
      )}
    </div>
  </div>
);

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    style={{
      whiteSpace: 'nowrap',
      padding: '16px 4px',
      borderBottom: active ? '2px solid #4f46e5' : '2px solid transparent',
      fontWeight: '500',
      fontSize: '14px',
      display: 'flex',
      alignItems: 'center',
      transition: 'all 0.2s',
      color: active ? '#4f46e5' : '#6b7280',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      borderBottomWidth: '2px',
      borderBottomStyle: 'solid',
      borderBottomColor: active ? '#4f46e5' : 'transparent'
    }}
  >
    {icon}
    {label}
  </button>
);

export default Dashboard;
