import React, { useMemo } from 'react';
import type { ProcessedPost } from '../types';
import ForceGraph2D from 'react-force-graph-2d';

interface NetworkTabProps {
  data: ProcessedPost[];
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #f3f4f6',
  overflow: 'hidden',
  height: '600px',
  position: 'relative'
};

const NetworkTab: React.FC<NetworkTabProps> = ({ data }) => {
  const graphData = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const nodeIds = new Set<string>();

    // Limit to top 150 posts for performance
    const sample = data.slice(0, 150);

    sample.forEach(post => {
      if (post.author && post.author !== '[deleted]' && post.domain && post.domain !== 'self' && post.domain !== 'reddit.com' && post.domain !== 'self.reddit' && post.domain !== 'unknown') {
        // Author Node
        if (!nodeIds.has(post.author)) {
          nodes.push({ id: post.author, group: 'user', val: 5 });
          nodeIds.add(post.author);
        }
        
        // Domain Node
        if (!nodeIds.has(post.domain)) {
          nodes.push({ id: post.domain, group: 'domain', val: 10 });
          nodeIds.add(post.domain);
        }

        // Link
        links.push({ source: post.author, target: post.domain });
      }
    });

    return { nodes, links };
  }, [data]);

  return (
    <div style={cardStyle}>
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        left: '16px', 
        zIndex: 10, 
        backgroundColor: 'rgba(255,255,255,0.95)', 
        padding: '16px', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>🕸️ Interaction Network</h3>
        <div style={{ marginTop: '8px', fontSize: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6', marginRight: '8px' }}></span>
            <span style={{ color: '#4b5563' }}>Users (Authors)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', marginRight: '8px' }}></span>
            <span style={{ color: '#4b5563' }}>External Domains</span>
          </div>
        </div>
      </div>
      
      {graphData.nodes.length > 0 ? (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="id"
          nodeColor={(node: any) => node.group === 'domain' ? '#ef4444' : '#3b82f6'}
          linkColor={() => '#6b7280'}
          nodeRelSize={6}
          linkWidth={1}
          width={1000}
          height={600}
        />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
          No network data available for current selection.
        </div>
      )}
    </div>
  );
};

export default NetworkTab;
