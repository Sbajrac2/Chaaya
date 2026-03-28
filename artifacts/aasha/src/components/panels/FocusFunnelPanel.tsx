import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Loader2, X, ChevronRight } from "lucide-react";
import type { WeatherData } from "@workspace/api-client-react/src/generated/api.schemas";

interface FocusFunnelPanelProps {
  sessionId: string;
  weather: WeatherData | undefined;
}

export function FocusFunnelPanel({ sessionId, weather }: FocusFunnelPanelProps) {
  const [tasks, setTasks] = useState(["", "", ""]);
  const [result, setResult] = useState<{ task: string; reason: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTask = (i: number, val: string) => {
    const t = [...tasks];
    t[i] = val;
    setTasks(t);
  };

  const filledTasks = tasks.filter((t) => t.trim().length > 0);

  const getFocusTask = async () => {
    if (filledTasks.length === 0) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/insights/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          tasks: filledTasks,
          weatherDescription: weather?.description,
          uvIndex: weather?.uvIndex,
          sunlightHours: weather?.sunlightHours,
        }),
      });
      if (!resp.ok) throw new Error("Failed");
      const data = await resp.json();
      setResult(data);
    } catch {
      setError("Couldn't reach Asha. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setTasks(["", "", ""]);
  };

  return (
    <div className="flex flex-col h-full px-7 pt-4 pb-16 overflow-y-auto">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-6">
              <Target size={20} className="text-violet-400/60" />
              <div>
                <p className="text-sm text-white/70 font-medium">One-Task Mode</p>
                <p className="text-[10px] text-white/30 mt-0.5">Enter up to 3 tasks. Asha picks the one your brain can handle right now.</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {tasks.map((task, i) => (
                <div key={i} className="relative">
                  <input
                    type="text"
                    placeholder={`Task ${i + 1}${i === 0 ? " (most urgent)" : ""}`}
                    value={task}
                    onChange={(e) => updateTask(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && i < 2) document.getElementById(`task-${i + 1}`)?.focus(); }}
                    id={`task-${i}`}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/40 transition-colors pr-10"
                  />
                  {task && (
                    <button
                      onClick={() => updateTask(i, "")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={getFocusTask}
              disabled={isLoading || filledTasks.length === 0}
              className="w-full py-4 rounded-2xl bg-violet-600/60 border border-violet-500/20 text-white font-display text-sm tracking-widest uppercase hover:bg-violet-600/80 active:scale-95 transition-all disabled:opacity-30 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <><Loader2 size={16} className="animate-spin" /> Reading your energy...</>
              ) : (
                <>Find my task <ChevronRight size={16} /></>
              )}
            </button>

            {error && <p className="text-xs text-red-400/60 mt-3 text-center">{error}</p>}

            <p className="text-[10px] text-white/20 text-center mt-5 leading-relaxed max-w-[240px] mx-auto">
              Asha looks at your current energy level, the weather, and your patterns to choose what will actually get done.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8 pt-4 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-violet-500/20 border border-violet-400/30 flex items-center justify-center"
            >
              <Target size={32} className="text-violet-400" />
            </motion.div>

            <div className="space-y-3 max-w-[280px]">
              <p className="text-[10px] font-display tracking-[0.35em] uppercase text-white/25">Start with this</p>
              <p className="text-2xl font-sans font-light text-white leading-snug">
                {result.task}
              </p>
              <p className="text-sm text-white/45 leading-relaxed mt-4">
                {result.reason}
              </p>
            </div>

            {/* Dimmed other tasks */}
            <div className="w-full space-y-2 opacity-30">
              <p className="text-[9px] font-display tracking-widest uppercase text-white/40 mb-3">Other tasks — waiting</p>
              {filledTasks.filter(t => t !== result.task).map((t, i) => (
                <div key={i} className="px-4 py-3 rounded-xl bg-white/3 border border-white/5 text-xs text-white/40 text-left">
                  {t}
                </div>
              ))}
            </div>

            <button
              onClick={reset}
              className="text-xs font-display tracking-widest uppercase text-white/25 hover:text-white/50 transition-colors mt-2"
            >
              Start over
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
