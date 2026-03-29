// import { useMemo } from "react";
// import { useGetCheckins } from "@workspace/api-client-react";
// import { motion } from "framer-motion";
// import { Loader2, TrendingUp, AlertCircle } from "lucide-react";

// interface DashboardPanelProps {
//   sessionId: string;
//   userName: string;
// }

// interface AreaScore {
//   id: string;
//   label: string;
//   emoji: string;
//   score: number; // 0-100
//   description: string;
//   status: "strength" | "weakness" | "balanced";
// }

// export function DashboardPanel({ sessionId, userName }: DashboardPanelProps) {
//   const { data: checkins, isLoading } = useGetCheckins(
//     { sessionId, limit: 100 },
//     { query: { enabled: !!sessionId, refetchOnMount: true } }
//   );

//   const scores = useMemo(() => {
//     const safeCheckins = Array.isArray(checkins) ? checkins : [];
//     if (safeCheckins.length === 0) return [];

//     const total = safeCheckins.length;

//     // Calculate scores for each area (0-100)
//     const areas: AreaScore[] = [
//       {
//         id: "attendance",
//         label: "Attendance",
//         emoji: "📚",
//         score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => c.attendedClass).length / total) * 100),
//         description: "",
//         status: "balanced",
//       },
//       {
//         id: "nutrition",
//         label: "Nutrition",
//         emoji: "🥗",
//         score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => c.ateWell).length / total) * 100),
//         description: "",
//         status: "balanced",
//       },
//       {
//         id: "movement",
//         label: "Movement",
//         emoji: "🚶",
//         score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => (c as any).leftRoom !== false).length / total) * 100),
//         description: "",
//         status: "balanced",
//       },
//       {
//         id: "sleep",
//         label: "Sleep",
//         emoji: "😴",
//         score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => !c.isLateNight).length / total) * 100),
//         description: "",
//         status: "balanced",
//       },
//       {
//         id: "authenticity",
//         label: "Authenticity",
//         emoji: "✨",
//         score: total === 0 ? 0 : Math.round((1 - safeCheckins.reduce((s, c) => s + (c.maskingLevel ?? 0), 0) / (total * 5)) * 100),
//         description: "",
//         status: "balanced",
//       },
//       {
//         id: "sunlight",
//         label: "Sunlight",
//         emoji: "☀️",
//         score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => c.hadSunlightExposure).length / total) * 100),
//         description: "",
//         status: "balanced",
//       },
//     ];

//     // Categorize as strength (70+), weakness (<40), or balanced
//     return areas.map(area => ({
//       ...area,
//       status: area.score >= 70 ? "strength" : area.score < 40 ? "weakness" : "balanced",
//     }));
//   }, [checkins]);

//   const strengths = scores.filter(s => s.status === "strength");
//   const weaknesses = scores.filter(s => s.status === "weakness");
//   const balanced = scores.filter(s => s.status === "balanced");

//   if (isLoading) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
//         <Loader2 className="w-6 h-6 animate-spin" />
//         <p className="text-[10px] font-display tracking-[0.3em] uppercase">Analyzing your patterns...</p>
//       </div>
//     );
//   }

//   if (scores.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30 px-6">
//         <AlertCircle size={24} />
//         <p className="text-sm text-white/40">No check-ins yet. Your dashboard will appear after your first check-in.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-full px-5 pt-3 pb-16 overflow-y-auto space-y-6">
//       <div className="space-y-1">
//         <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20">Dashboard</p>
//         <p className="text-xs text-white/35">Your strengths and growth areas</p>
//       </div>

//       {strengths.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="space-y-3"
//         >
//           <div className="flex items-center gap-2">
//             <TrendingUp size={14} className="text-emerald-400" />
//             <p className="text-[10px] font-display tracking-[0.3em] uppercase text-emerald-400/70">You're doing great in</p>
//           </div>
//           <div className="space-y-2">
//             {strengths.map((area, i) => (
//               <AreaBar key={area.id} area={area} index={i} />
//             ))}
//           </div>
//         </motion.div>
//       )}

//       {balanced.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="space-y-3"
//         >
//           <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/30">Also tracking</p>
//           <div className="space-y-2">
//             {balanced.map((area, i) => (
//               <AreaBar key={area.id} area={area} index={i} />
//             ))}
//           </div>
//         </motion.div>
//       )}

//       {weaknesses.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//           className="space-y-3"
//         >
//           <div className="flex items-center gap-2">
//             <AlertCircle size={14} className="text-amber-400" />
//             <p className="text-[10px] font-display tracking-[0.3em] uppercase text-amber-400/70">Let's focus on</p>
//           </div>
//           <div className="space-y-2">
//             {weaknesses.map((area, i) => (
//               <AreaBar key={area.id} area={area} index={i} />
//             ))}
//           </div>
//         </motion.div>
//       )}

//       {scores.length > 0 && (
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="mt-6 pt-6 border-t border-white/8 space-y-3"
//         >
//           <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20">All areas overview</p>
//           <div className="space-y-3">
//             {scores.map((area) => (
//               <div key={area.id} className="space-y-1">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-white/60 flex items-center gap-1.5">
//                     <span>{area.emoji}</span>
//                     {area.label}
//                   </span>
//                   <span className="text-xs font-display text-white/40">{area.score}%</span>
//                 </div>
//                 <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/8">
//                   <motion.div
//                     initial={{ width: 0 }}
//                     animate={{ width: `${area.score}%` }}
//                     transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
//                     className={`h-full rounded-full ${
//                       area.status === "strength"
//                         ? "bg-emerald-500/60"
//                         : area.status === "weakness"
//                         ? "bg-amber-500/50"
//                         : "bg-white/20"
//                     }`}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </motion.div>
//       )}

//       <div className="pb-6 space-y-2 text-[9px] text-white/25 leading-relaxed">
//         <p>
//           📊 <span className="text-white/35">These scores are based on your recent check-ins.</span>
//         </p>
//         <p>
//           💡 <span className="text-white/35">Higher scores mean you're doing well in that area. Lower scores show where support could help.</span>
//         </p>
//       </div>
//     </div>
//   );
// }

// function AreaBar({ area, index }: { area: AreaScore; index: number }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, x: -10 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ delay: index * 0.05 }}
//       className="flex items-center gap-3"
//     >
//       <span className="text-xl w-6 shrink-0">{area.emoji}</span>
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center justify-between mb-1">
//           <span className="text-sm text-white/70">{area.label}</span>
//           <span className="text-xs font-display text-white/40">{area.score}%</span>
//         </div>
//         <div className="w-full h-2.5 bg-white/4 rounded-full overflow-hidden border border-white/8">
//           <motion.div
//             initial={{ width: 0 }}
//             animate={{ width: `${area.score}%` }}
//             transition={{ duration: 0.7, delay: 0.1 + index * 0.05, ease: "easeOut" }}
//             className={`h-full rounded-full shadow-lg ${
//               area.status === "strength"
//                 ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/30"
//                 : area.status === "weakness"
//                 ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-amber-500/20"
//                 : "bg-gradient-to-r from-white/20 to-white/10"
//             }`}
//           />
//         </div>
//       </div>
//     </motion.div>
//   );
// }
import { useMemo } from "react";
import { useGetCheckins } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { 
  Loader2, TrendingUp, AlertCircle, BrainCircuit, 
  ArrowUpRight, ArrowDownRight, ShieldAlert 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardPanelProps {
  sessionId: string;
  userName: string;
}

interface AreaScore {
  id: string;
  label: string;
  emoji: string;
  score: number; 
  status: "strength" | "weakness" | "balanced";
}

export function DashboardPanel({ sessionId, userName }: DashboardPanelProps) {
  const { data: checkins, isLoading } = useGetCheckins(
    { sessionId, limit: 100 },
    { 
      query: { 
        enabled: !!sessionId, 
        refetchOnMount: true,
        queryKey: ['checkins', sessionId, 100]
      } 
    }
  );

  const { scores, burnoutRisk, polygonPoints, reports, fragility } = useMemo(() => {
    const safeCheckins = Array.isArray(checkins) ? checkins : [];
    if (safeCheckins.length === 0) return { scores: [], burnoutRisk: 0, polygonPoints: "", reports: null, fragility: null };

    const total = safeCheckins.length;
    const recent = safeCheckins.slice(0, 7); 

    const areas: AreaScore[] = [
      { id: "acad", label: "ACADEMIC", emoji: "🧠", score: Math.round((safeCheckins.reduce((s, c) => s + ((c as any).energyLevel || (c.attendedClass ? 8 : 2)), 0) / (total * 10)) * 100), status: "balanced" },
      { id: "nour", label: "NOURISH", emoji: "🍲", score: Math.round((safeCheckins.reduce((s, c) => s + ((c as any).mealsCount || (c.ateWell ? 2 : 0)), 0) / (total * 3)) * 100), status: "balanced" },
      { id: "phys", label: "PHYSICAL", emoji: "👣", score: Math.round((safeCheckins.reduce((s, c) => s + ((c as any).activityLevel || (c.leftRoom ? 3 : 1)), 0) / (total * 5)) * 100), status: "balanced" },
      { id: "auth", label: "AUTHENTIC", emoji: "🎭", score: Math.round((1 - safeCheckins.reduce((s, c) => s + (c.maskingLevel ?? 3), 0) / (total * 5)) * 100), status: "balanced" },
    ];

    const points = areas.map((a, i) => {
      const angle = (i * 2 * Math.PI) / areas.length - Math.PI / 2;
      const r = (a.score / 100) * 120;
      return `${150 + r * Math.cos(angle)},${150 + r * Math.sin(angle)}`;
    }).join(" ");

    const avgMasking = recent.reduce((s, c) => s + (c.maskingLevel ?? 3), 0) / Math.max(recent.length, 1);
    const avgEnergy = recent.reduce((s, c) => s + ((c as any).energyLevel || 5), 0) / Math.max(recent.length, 1);
    const currentRisk = Math.min(Math.round((avgMasking / 5) * 60 + ((10 - avgEnergy) / 10) * 40), 100);

    const riskTrendPerBadDay = 18; 
    const daysToBreak = Math.max(1, Math.floor((88 - currentRisk) / riskTrendPerBadDay));

    const sorted = [...areas].sort((a, b) => b.score - a.score);
    
    return {
      scores: areas.map(a => ({ ...a, status: a.score >= 75 ? "strength" : a.score < 45 ? "weakness" : "balanced" })),
      burnoutRisk: currentRisk,
      polygonPoints: points,
      reports: { best: sorted[0], worst: sorted[3] },
      fragility: { 
        days: daysToBreak, 
        status: daysToBreak <= 2 ? "CRITICAL" : daysToBreak <= 4 ? "MODERATE" : "STABLE" 
      }
    };
  }, [checkins]);

  if (isLoading) return <LoadingState />;
  if (!reports || !fragility) return <EmptyState />;

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-24 overflow-y-auto no-scrollbar space-y-12">
      
      {/* 1. BURNOUT RISK HERO */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-10 border-b border-white/5"
      >
        <div className="flex items-center gap-2 mb-2 opacity-30">
          <BrainCircuit size={14} className="text-violet-500" />
          <span className="text-[8px] uppercase tracking-[0.5em]">Neural Risk Engine</span>
        </div>
        <h1 className="text-9xl font-thin tracking-tighter text-white">
          {burnoutRisk}<span className="text-3xl text-violet-500/40 ml-2">%</span>
        </h1>
        <p className="text-[10px] uppercase tracking-[0.6em] text-violet-400 font-bold mt-4">Possibility of Burnout</p>
      </motion.section>

      {/* 2. SYSTEM FRAGILITY CARD */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "p-8 rounded-[3rem] border backdrop-blur-3xl transition-colors duration-500",
          fragility.status === "CRITICAL" ? "bg-red-500/5 border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.05)]" : "bg-white/[0.02] border-white/10"
        )}
      >
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">Fragility Assessment</span>
            <h4 className="text-xl font-light text-white leading-tight">System Tolerance</h4>
          </div>
          <div className={cn(
            "px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest",
            fragility.status === "CRITICAL" ? "bg-red-500 text-white" : "bg-violet-600 text-white"
          )}>
            {fragility.status}
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-6xl font-thin text-white">{fragility.days}</p>
            <p className="text-[8px] uppercase tracking-widest text-white/20 mt-1">Days Left</p>
          </div>
          <div className="h-16 w-[1px] bg-white/10 shrink-0" />
          <p className="text-xs text-white/40 leading-relaxed font-light">
            You can sustain <span className="text-white font-medium">{fragility.days} more days</span> of 
            inconsistency before your <span className="text-violet-400">{reports.worst.label}</span> node reaches a critical failure state.
          </p>
        </div>

        <div className="mt-10 h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "100%" }} 
            animate={{ width: `${(fragility.days / 7) * 100}%` }}
            className={cn("h-full", fragility.status === "CRITICAL" ? "bg-red-500" : "bg-violet-500")}
          />
        </div>
      </motion.div>

      {/* 3. KNOWLEDGE GRAPH VISUALIZATION */}
      <div className="relative w-full aspect-square max-w-[360px] mx-auto flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="w-full h-full drop-shadow-[0_0_30px_rgba(139,92,246,0.2)]">
          {[40, 80, 120].map(r => (
            <circle key={r} cx="150" cy="150" r={r} fill="none" stroke="white" strokeOpacity="0.03" strokeWidth="1" />
          ))}
          {[0, 90, 180, 270].map(angle => (
            <line key={angle} x1="150" y1="150" x2={150 + 120 * Math.cos((angle-90)*Math.PI/180)} y2={150 + 120 * Math.sin((angle-90)*Math.PI/180)} stroke="white" strokeOpacity="0.05" />
          ))}
          
          <motion.polygon
            points={polygonPoints}
            fill="rgba(139, 92, 246, 0.15)"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>

        <NodeLabel label="ACADEMIC" pos="top-0 left-1/2 -translate-x-1/2" icon="🧠" />
        <NodeLabel label="NOURISH" pos="top-1/2 -right-6 -translate-y-1/2" icon="🍲" />
        <NodeLabel label="PHYSICAL" pos="bottom-0 left-1/2 -translate-x-1/2" icon="👣" />
        <NodeLabel label="AUTHENTIC" pos="top-1/2 -left-6 -translate-y-1/2" icon="🎭" />
      </div>

      {/* 4. WEEKLY HABIT REPORTS */}
      <div className="grid grid-cols-2 gap-4 pb-12">
        <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-emerald-500/10 space-y-3">
          <div className="flex justify-between items-center text-emerald-400">
            <span className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-50">Best Habit</span>
            <ArrowUpRight size={16} />
          </div>
          <p className="text-xl font-light text-white">{reports.best.label}</p>
        </div>
        
        <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-red-500/10 space-y-3">
          <div className="flex justify-between items-center text-red-400">
            <span className="text-[8px] uppercase tracking-[0.4em] font-bold opacity-50">Worst Habit</span>
            <ArrowDownRight size={16} />
          </div>
          <p className="text-xl font-light text-white">{reports.worst.label}</p>
        </div>
      </div>
    </div>
  );
}

function NodeLabel({ label, pos, icon }: { label: string; pos: string; icon: string }) {
  return (
    <div className={cn("absolute flex flex-col items-center gap-1.5", pos)}>
      <span className="text-xl drop-shadow-2xl">{icon}</span>
      <span className="text-[8px] uppercase tracking-[0.4em] text-white/20 font-bold">{label}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-6">
      <Loader2 className="animate-spin text-violet-500 w-8 h-8" />
      <span className="text-[10px] uppercase tracking-[0.5em] text-white/20">Synthesizing Network...</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-20 text-center gap-6">
      <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center">
        <ShieldAlert className="text-white/10" size={24} />
      </div>
      <p className="text-xs text-white/20 leading-relaxed font-light tracking-[0.2em] uppercase">
        Network formation incomplete. Awaiting further petals.
      </p>
    </div>
  );
}