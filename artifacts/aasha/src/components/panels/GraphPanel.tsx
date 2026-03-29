import { useEffect, useState } from 'react';
import { useGetGraph } from '@workspace/api-client-react'; // Will be generated later
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  data: any;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function GraphPanel({ sessionId }: { sessionId: string }) {
  const [elements, setElements] = useState<any[]>([]);
  const { data: graphData, isLoading } = useGetGraph({ sessionId }, { 
    query: { enabled: !!sessionId } 
  });

  useEffect(() => {
    if (graphData) {
      const nodes = graphData.nodes.map((node: GraphNode) => ({
        id: node.id,
        data: { label: node.label },
        position: { x: Math.random() * 400, y: Math.random() * 400 },
        style: {
          background: `hsl(${node.data.score * 36}, 70%, 50%)`,
          border: `1px solid hsl(${node.data.score * 36}, 70%, 40%)`,
        }
      }));
      const edges = graphData.edges.map((edge: GraphEdge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        data: { label: edge.label },
        style: { stroke: '#a78bfa' }
      }));
      setElements([...nodes, ...edges]);
    }
  }, [graphData]);

  if (isLoading || !graphData) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm text-white/40">Building knowledge graph...</p>
        <p className="text-xs text-white/20">Add check-ins to see patterns emerge</p>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <span className="text-2xl opacity-40">🧠</span>
        </div>
        <p className="text-sm text-white/40 text-center max-w-md">
          Knowledge graph will visualize connections between your check-ins.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full px-4 pt-3 pb-12">
      <div className="space-y-1 mb-4">
        <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/25">Knowledge Graph</p>
        <p className="text-xs text-white/40">
          {graphData.nodes.length} checkins · {graphData.edges.length} patterns detected
        </p>
      </div>
      <div className="flex-1 bg-white/3 backdrop-blur-sm border border-white/5 rounded-2xl p-4 overflow-hidden relative">
        {graphData.nodes.length > 0 && (
          <div className="h-full w-full" style={{ 
            backgroundImage: 'radial-gradient(circle at 25% 25%, hsl(160 100% 30%/0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, hsl(200 100% 40%/0.1) 0%, transparent 50%)',
            backgroundSize: '400px 400px',
          }}>
            {/* Placeholder graph viz - replace with react-graph-vis or Cytoscape */}
            <div className="absolute inset-0 grid grid-cols-5 gap-2 p-4 opacity-20 pointer-events-none">
              {graphData.nodes.slice(0, 25).map((node: GraphNode, i: number) => (
                <motion.div
                  key={node.id}
                  className="w-4 h-4 rounded-full border"
                  style={{ 
                    backgroundColor: `hsl(${node.data.score * 36}, 70%, 50%)`,
                    borderColor: `hsl(${node.data.score * 36}, 70%, 40%)`,
                  }}
                  animate={{ 
                    x: [0, Math.sin(i * 0.5) * 20, 0],
                    y: [0, Math.cos(i * 0.5) * 20, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ 
                    duration: 20 + i * 0.5, 
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <motion.p 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-lg font-display text-white/60 mb-2"
              >
                Graph ready ({graphData.nodes.length} nodes)
              </motion.p>
              <p className="text-xs text-white/30 max-w-sm">
                Patterns connecting your check-ins. Click nodes to explore correlations.
              </p>
              <div className="mt-6 text-[10px] text-white/20 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span>High score</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <span>Low score</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

