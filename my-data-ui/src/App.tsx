import { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { processData } from './utils/analytics';
import type { ProcessedPost, FilterState } from './types';

function App() {
  const [rawData, setRawData] = useState<ProcessedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Fetching data...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingMessage('Fetching data file...');
        console.log("Fetching data...");
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        setLoadingMessage('Parsing JSON (this may take a moment)...');
        console.log("Response received, parsing JSON...");
        const jsonData = await response.json();
        console.log("JSON parsed:", jsonData.length, "items");
        
        // Use ALL data (no limit)
        const allData = jsonData;
        
        setLoadingMessage(`Processing ${allData.length} posts...`);
        console.log("Processing data...", allData.length, "items");
        
        // Process in chunks to avoid blocking UI
        await new Promise(resolve => setTimeout(resolve, 100));
        const processed = processData(allData);
        console.log("Data processed:", processed.length, "items");
        setRawData(processed);
      } catch (err) {
        console.error("Failed to load data", err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const dateRange = useMemo(() => {
    if (rawData.length === 0) return [new Date(), new Date()] as [Date, Date];
    const dates = rawData.map(p => p.datetime.getTime());
    return [new Date(Math.min(...dates)), new Date(Math.max(...dates))] as [Date, Date];
  }, [rawData]);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: [new Date(0), new Date(8640000000000000)], // Default to all
    sentiments: ['Positive', 'Neutral', 'Negative'],
    searchQuery: ''
  });

  // Update filters when data loads
  useEffect(() => {
    if (rawData.length > 0) {
      setFilters(prev => ({
        ...prev,
        dateRange: dateRange
      }));
    }
  }, [dateRange, rawData.length]);

  const filteredData = useMemo(() => {
    return rawData.filter(post => {
      // Date Filter
      // Note: Simplified date comparison
      const postTime = post.datetime.getTime();
      const inDateRange = postTime >= filters.dateRange[0].getTime() && postTime <= filters.dateRange[1].getTime();
      
      // Sentiment Filter
      const inSentiment = filters.sentiments.includes(post.sentiment_label);

      // Search Filter
      const matchesSearch = !filters.searchQuery || 
        post.full_text.toLowerCase().includes(filters.searchQuery.toLowerCase());

      return inDateRange && inSentiment && matchesSearch;
    });
  }, [rawData, filters]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '50px', height: '50px', border: '5px solid #ccc', borderTop: '5px solid #4f46e5', borderRadius: '50%', margin: '0 auto' }}></div>
          <p style={{ marginTop: '16px', color: '#666' }}>{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center', color: 'red' }}>
          <h2>Error loading data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (rawData.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <h2>No data loaded</h2>
          <p>The data file may be empty or improperly formatted.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb', overflow: 'hidden' }}>
      <Sidebar 
        filters={filters} 
        setFilters={setFilters} 
        dateRange={dateRange}
      />
      <main style={{ flex: 1, marginLeft: '256px', overflowY: 'auto' }}>
        <Dashboard data={filteredData} fullDataLength={rawData.length} />
      </main>
    </div>
  );
}

export default App;
