import { useEffect, useState } from 'react';
// import { useGetGraph } from '@workspace/api-client-react'; // Will be generated later
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
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
      <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
        <span className="text-2xl opacity-40">🧠</span>
      </div>
      <p className="text-sm text-white/40 text-center max-w-md">
        Knowledge graph will visualize connections between your check-ins.
      </p>
      <p className="text-xs text-white/20">Coming soon...</p>
    </div>
  );
}

