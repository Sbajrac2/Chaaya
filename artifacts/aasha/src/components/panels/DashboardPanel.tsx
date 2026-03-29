import { useMemo, useState } from "react";
import { useGetCheckins } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, TrendingUp, AlertCircle, BrainCircuit, 
  ArrowUpRight, ArrowDownRight, ShieldAlert, 
  Lightbulb, Target, Zap, Heart, Coffee, Moon, 
  Sun, Users, BookOpen, CheckCircle2, ChevronDown,
  ChevronUp, Sparkles
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
    { enabled: !!sessionId, refetchOnMount: true } as any // workaround for query options typing
  );

  const scores = useMemo<AreaScore[]>(() => {
    const safeCheckins = Array.isArray(checkins) ? checkins : [];
    if (safeCheckins.length === 0) return [];
    const total = safeCheckins.length;
    const areas: AreaScore[] = [
      {
        id: "attendance",
        label: "Attendance",
        emoji: "📚",
        score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => c.attendedClass).length / total) * 100),
        status: "balanced" as const,
      },
      {
        id: "nutrition",
        label: "Nutrition",
        emoji: "🥗",
        score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => c.ateWell).length / total) * 100),
        status: "balanced" as const,
      },
      {
        id: "movement",
        label: "Movement",
        emoji: "🚶",
        score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => (c as any).leftRoom !== false).length / total) * 100),
        status: "balanced" as const,
      },
      {
        id: "sleep",
        label: "Sleep",
        emoji: "😴",
        score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => !c.isLateNight).length / total) * 100),
        status: "balanced" as const,
      },
      {
        id: "authenticity",
        label: "Being Yourself",
        emoji: "✨",
        score: total === 0 ? 0 : Math.round((1 - safeCheckins.reduce((s, c) => s + (c.maskingLevel ?? 0), 0) / (total * 5)) * 100),
        status: "balanced" as const,
      },
      {
        id: "sunlight",
        label: "Sunlight",
        emoji: "☀️",
        score: total === 0 ? 0 : Math.round((safeCheckins.filter(c => c.hadSunlightExposure).length / total) * 100),
        status: "balanced" as const,
      },
    ];
    return areas.map(area => ({
      ...area,
      status: area.score >= 70 ? "strength" as const : area.score < 40 ? "weakness" as const : "balanced" as const,
    }));
  }, [checkins]);

  // Calculate burnoutRisk (example: average of all scores below 50)
  const burnoutRisk = useMemo(() => {
    if (!scores.length) return 0;
    const lowScores = scores.filter(s => s.score < 50);
    if (!lowScores.length) return 0;
    return Math.round(
      (lowScores.reduce((sum, s) => sum + (50 - s.score), 0) / (lowScores.length * 50)) * 100
    );
  }, [scores]);

  // Find best and worst area
  const reports = useMemo(() => {
    if (!scores.length) return { best: { label: "-" }, worst: { label: "-" } };
    const sorted = [...scores].sort((a, b) => b.score - a.score);
    return {
      best: sorted[0],
      worst: sorted[sorted.length - 1],
    };
  }, [scores]);

  // Calculate fragility (example: days left before critical, based on lowest score)
  const fragility = useMemo(() => {
    if (!scores.length) return { days: 7, status: "STABLE" };
    const minScore = Math.min(...scores.map(s => s.score));
    const days = Math.max(1, Math.round((minScore / 100) * 7));
    return {
      days,
      status: minScore < 30 ? "CRITICAL" : "STABLE",
    };
  }, [scores]);

  // Calculate polygonPoints for radar/graph (example: 4-point for 4 main areas)
  const polygonPoints = useMemo(() => {
    const r = 80;
    const center = 150;
    const points = [0, 1, 2, 3].map((i, idx) => {
      const angle = (Math.PI / 2) + (idx * (Math.PI / 2));
      const pct = (scores[i]?.score ?? 0) / 100;
      const x = center + r * pct * Math.cos(angle);
      const y = center + r * pct * Math.sin(angle);
      return `${x},${y}`;
    });
    return points.join(" ");
  }, [scores]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-[10px] font-display tracking-[0.3em] uppercase">Analyzing your patterns...</p>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30 px-6">
        <AlertCircle size={24} />
        <p className="text-sm text-white/40">No check-ins yet. Your dashboard will appear after your first check-in.</p>
      </div>
    );
  }

  return (
    <ActionableImprovements
      scores={scores}
      fragility={fragility}
      burnoutRisk={burnoutRisk}
      reports={reports}
      polygonPoints={polygonPoints}
    />
  );
}

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


type ReportsType = { best: { label: string }; worst: { label: string } };
interface ActionableImprovementsProps {
  scores: AreaScore[];
  fragility: { days: number; status: string };
  burnoutRisk: number;
  reports: ReportsType;
  polygonPoints: string;
}

function ActionableImprovements({ scores, fragility, burnoutRisk, reports, polygonPoints }: ActionableImprovementsProps) {

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-24 overflow-y-auto no-scrollbar space-y-12">

      {/* PREDICTIVE FORECAST SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-violet-700/30 bg-violet-900/10 p-6 mb-2 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-violet-400" size={18} />
          <span className="text-xs font-bold uppercase tracking-widest text-violet-300">Forecast</span>
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Mental Health Forecast: {burnoutRisk >= 60 ? "High Risk" : burnoutRisk >= 30 ? "Moderate Risk" : "Stable"}</h2>
        <div className="text-white/80 text-sm mb-2">
          {burnoutRisk >= 60 && (
            <>
              <b>Warning:</b> Our system predicts a high risk of burnout in the next 48 hours.<br />
              <span className="text-violet-300">Key signals: {fragility.days <= 2 ? "Low system tolerance, " : ""}{reports.worst.label} is critically low.</span>
            </>
          )}
          {burnoutRisk >= 30 && burnoutRisk < 60 && (
            <>
              <b>Heads up:</b> You may experience increased stress or fatigue soon.<br />
              <span className="text-violet-300">Focus on improving: {reports.worst.label}.</span>
            </>
          )}
          {burnoutRisk < 30 && (
            <>
              <b>Looking good!</b> Your behavioral signals are stable. Keep up your routines.<br />
              <span className="text-violet-300">Maintain strengths: {reports.best.label}.</span>
            </>
          )}
        </div>
        <div className="text-white/70 text-xs">
          <b>Actionable Tip:</b> {burnoutRisk >= 60
            ? `Take a restorative break today. Prioritize sleep and reach out to a friend or mentor.`
            : burnoutRisk >= 30
              ? `Try a 10-minute walk or mindfulness exercise. Small resets can prevent bigger crashes.`
              : `Celebrate your consistency! Share your strategies with someone who might need them.`}
        </div>
      </motion.section>

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

      {/* 5. ACTIONABLE IMPROVEMENTS */}
      {/* (Handled by parent DashboardPanel now) */}
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


function StrategyCard({ 
  title, 
  description, 
  actions, 
  color, 
  expanded, 
  onToggle 
}: { 
  title: string; 
  description: string; 
  actions: string[]; 
  color: 'emerald' | 'blue' | 'violet' | 'pink'; 
  expanded: boolean; 
  onToggle: () => void; 
}) {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-300',
      icon: 'text-emerald-400'
    },
    blue: {
      bg: 'bg-blue-500/5',
      border: 'border-blue-500/20',
      text: 'text-blue-300',
      icon: 'text-blue-400'
    },
    violet: {
      bg: 'bg-violet-500/5',
      border: 'border-violet-500/20',
      text: 'text-violet-300',
      icon: 'text-violet-400'
    },
    pink: {
      bg: 'bg-pink-500/5',
      border: 'border-pink-500/20',
      text: 'text-pink-300',
      icon: 'text-pink-400'
    }
  };

  const classes = colorClasses[color];

  return (
    <motion.div 
      layout
      className={`rounded-[2rem] ${classes.bg} border ${classes.border} overflow-hidden`}
    >
      <button
        onClick={onToggle}
        className="w-full p-5 text-left hover:bg-white/[0.01] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h5 className={`text-base font-light ${classes.text} mb-1`}>{title}</h5>
            <p className="text-xs text-white/40 leading-relaxed">{description}</p>
          </div>
          {expanded ? 
            <ChevronUp size={18} className="text-white/40 ml-3" /> : 
            <ChevronDown size={18} className="text-white/40 ml-3" />
          }
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="p-5 space-y-3">
              {actions.map((action, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 size={16} className={`${classes.icon} mt-0.5 shrink-0`} />
                  <span className="text-sm text-white/70 leading-relaxed">{action}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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