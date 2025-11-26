import React, { useState, useEffect } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Info } from 'lucide-react';

interface SemanticPoint {
  id: string;
  x: number;
  y: number;
  cluster: number;
  author: string;
  text: string;
}

interface SemanticMapData {
  points: SemanticPoint[];
  clusters: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'];

const SemanticMap: React.FC = () => {
  const [data, setData] = useState<SemanticMapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/precomputed/semantic_map.json')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load semantic map:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading semantic map...</div>;
  if (!data) return <div style={{ padding: '20px', textAlign: 'center' }}>Semantic map data not available. Run the python script first.</div>;

  // Sample data to improve performance if too many points
  const displayPoints = data.points.length > 2000 
    ? data.points.filter((_, i) => i % Math.ceil(data.points.length / 2000) === 0) 
    : data.points;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          maxWidth: '300px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px' }}>{point.author}</p>
          <p style={{ margin: 0 }}>{point.text}</p>
          <p style={{ margin: '5px 0 0', color: '#666', fontSize: '10px' }}>Cluster {point.cluster + 1}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '500px', width: '100%', backgroundColor: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Semantic Post Map</h3>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#666' }}>
          <Info size={14} style={{ marginRight: '4px' }} />
          <span>Posts with similar content are closer together</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="90%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis type="number" dataKey="x" name="X" hide />
          <YAxis type="number" dataKey="y" name="Y" hide />
          <ZAxis type="number" range={[20, 20]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {Array.from({ length: data.clusters }).map((_, index) => (
            <Scatter 
              key={index} 
              name={`Topic Group ${index + 1}`} 
              data={displayPoints.filter(p => p.cluster === index)} 
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SemanticMap;
