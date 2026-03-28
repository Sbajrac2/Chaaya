import { useMemo } from "react";
import { useGetCheckins } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";

interface DashboardPanelProps {
  sessionId: string;
  userName: string;
}

interface AreaScore {
  id: string;
  label: string;
  emoji: string;
  score: number; // 0-100
  description: string;
  status: "strength" | "weakness" | "balanced";
}

export function DashboardPanel({ sessionId, userName }: DashboardPanelProps) {
  const { data: checkins, isLoading } = useGetCheckins(
    { sessionId, limit: 100 },
    { query: { enabled: !!sessionId, refetchOnMount: true } }
  );

  const scores = useMemo(() => {
    if (!checkins || checkins.length === 0) return [];

    const all = checkins;
    const total = all.length;

    // Calculate scores for each area (0-100)
    const areas: AreaScore[] = [
      {
        id: "attendance",
        label: "Attendance",
        emoji: "📚",
        score: Math.round((all.filter(c => c.attendedClass).length / total) * 100),
        description: "",
        status: "balanced",
      },
      {
        id: "nutrition",
        label: "Nutrition",
        emoji: "🥗",
        score: Math.round((all.filter(c => c.ateWell).length / total) * 100),
        description: "",
        status: "balanced",
      },
      {
        id: "movement",
        label: "Movement",
        emoji: "🚶",
        score: Math.round((all.filter(c => (c as any).leftRoom !== false).length / total) * 100),
        description: "",
        status: "balanced",
      },
      {
        id: "sleep",
        label: "Sleep",
        emoji: "😴",
        score: Math.round((all.filter(c => !c.isLateNight).length / total) * 100),
        description: "",
        status: "balanced",
      },
      {
        id: "authenticity",
        label: "Authenticity",
        emoji: "✨",
        score: Math.round((1 - all.reduce((s, c) => s + (c.maskingLevel ?? 0), 0) / (total * 5)) * 100),
        description: "",
        status: "balanced",
      },
      {
        id: "sunlight",
        label: "Sunlight",
        emoji: "☀️",
        score: Math.round((all.filter(c => c.hadSunlightExposure).length / total) * 100),
        description: "",
        status: "balanced",
      },
    ];

    // Categorize as strength (70+), weakness (<40), or balanced
    return areas.map(area => ({
      ...area,
      status: area.score >= 70 ? "strength" : area.score < 40 ? "weakness" : "balanced",
    }));
  }, [checkins]);

  const strengths = scores.filter(s => s.status === "strength");
  const weaknesses = scores.filter(s => s.status === "weakness");
  const balanced = scores.filter(s => s.status === "balanced");

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
    <div className="flex flex-col h-full px-5 pt-3 pb-16 overflow-y-auto space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20">Dashboard</p>
        <p className="text-xs text-white/35">Your strengths and growth areas</p>
      </div>

      {strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-400" />
            <p className="text-[10px] font-display tracking-[0.3em] uppercase text-emerald-400/70">You're doing great in</p>
          </div>
          <div className="space-y-2">
            {strengths.map((area, i) => (
              <AreaBar key={area.id} area={area} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {balanced.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/30">Also tracking</p>
          <div className="space-y-2">
            {balanced.map((area, i) => (
              <AreaBar key={area.id} area={area} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {weaknesses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-amber-400" />
            <p className="text-[10px] font-display tracking-[0.3em] uppercase text-amber-400/70">Let's focus on</p>
          </div>
          <div className="space-y-2">
            {weaknesses.map((area, i) => (
              <AreaBar key={area.id} area={area} index={i} />
            ))}
          </div>
        </motion.div>
      )}

      {scores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 pt-6 border-t border-white/8 space-y-3"
        >
          <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20">All areas overview</p>
          <div className="space-y-3">
            {scores.map((area) => (
              <div key={area.id} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60 flex items-center gap-1.5">
                    <span>{area.emoji}</span>
                    {area.label}
                  </span>
                  <span className="text-xs font-display text-white/40">{area.score}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${area.score}%` }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      area.status === "strength"
                        ? "bg-emerald-500/60"
                        : area.status === "weakness"
                        ? "bg-amber-500/50"
                        : "bg-white/20"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="pb-6 space-y-2 text-[9px] text-white/25 leading-relaxed">
        <p>
          📊 <span className="text-white/35">These scores are based on your recent check-ins.</span>
        </p>
        <p>
          💡 <span className="text-white/35">Higher scores mean you're doing well in that area. Lower scores show where support could help.</span>
        </p>
      </div>
    </div>
  );
}

function AreaBar({ area, index }: { area: AreaScore; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3"
    >
      <span className="text-xl w-6 shrink-0">{area.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/70">{area.label}</span>
          <span className="text-xs font-display text-white/40">{area.score}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/4 rounded-full overflow-hidden border border-white/8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${area.score}%` }}
            transition={{ duration: 0.7, delay: 0.1 + index * 0.05, ease: "easeOut" }}
            className={`h-full rounded-full shadow-lg ${
              area.status === "strength"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-emerald-500/30"
                : area.status === "weakness"
                ? "bg-gradient-to-r from-amber-500 to-amber-400 shadow-amber-500/20"
                : "bg-gradient-to-r from-white/20 to-white/10"
            }`}
          />
        </div>
      </div>
    </motion.div>
  );
}
