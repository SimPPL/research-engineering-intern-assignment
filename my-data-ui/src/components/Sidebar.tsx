import React from 'react';
import type { FilterState } from '../types';
import { Search, Filter, Calendar } from 'lucide-react';

interface SidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  dateRange: [Date, Date]; // Min and Max available dates
}

const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const Sidebar: React.FC<SidebarProps> = ({ filters, setFilters, dateRange }) => {
  const handleSentimentChange = (sentiment: string) => {
    const newSentiments = filters.sentiments.includes(sentiment)
      ? filters.sentiments.filter(s => s !== sentiment)
      : [...filters.sentiments, sentiment];
    setFilters({ ...filters, sentiments: newSentiments });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setFilters({ ...filters, dateRange: [newDate, filters.dateRange[1]] });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setFilters({ ...filters, dateRange: [filters.dateRange[0], newDate] });
    }
  };

  return (
    <div 
      style={{ 
        width: '256px', 
        backgroundColor: 'white', 
        borderRight: '1px solid #e5e7eb', 
        height: '100vh', 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        left: 0, 
        top: 0, 
        overflowY: 'auto' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
        <img src="https://img.icons8.com/fluency/96/000000/search-client.png" alt="Logo" style={{ width: '40px', height: '40px', marginRight: '8px' }} />
        <div>
          <h1 style={{ fontWeight: 'bold', fontSize: '18px', color: '#1f2937', margin: 0 }}>SimPPL</h1>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Analyst Watchtower</p>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
          <Filter style={{ width: '16px', height: '16px', marginRight: '8px' }} /> Filters
        </h3>

        {/* Date Range - Selectable */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
            <Calendar style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
            Date Range
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: '#6b7280' }}>From:</label>
              <input
                type="date"
                value={formatDateForInput(filters.dateRange[0])}
                min={formatDateForInput(dateRange[0])}
                max={formatDateForInput(dateRange[1])}
                onChange={handleStartDateChange}
                style={{ 
                  width: '100%', 
                  padding: '6px 8px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: '#6b7280' }}>To:</label>
              <input
                type="date"
                value={formatDateForInput(filters.dateRange[1])}
                min={formatDateForInput(dateRange[0])}
                max={formatDateForInput(dateRange[1])}
                onChange={handleEndDateChange}
                style={{ 
                  width: '100%', 
                  padding: '6px 8px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>Sentiment</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Positive', 'Neutral', 'Negative'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.sentiments.includes(s)}
                  onChange={() => handleSentimentChange(s)}
                  style={{ accentColor: '#4f46e5' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>{s}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Keyword Search</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              style={{ 
                width: '100%', 
                paddingLeft: '32px', 
                paddingRight: '12px', 
                paddingTop: '8px', 
                paddingBottom: '8px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px', 
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              placeholder="Search content..."
            />
            <Search style={{ width: '16px', height: '16px', color: '#9ca3af', position: 'absolute', left: '10px', top: '10px' }} />
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
        <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
          SimPPL Research Engineering<br/> Assignment
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
