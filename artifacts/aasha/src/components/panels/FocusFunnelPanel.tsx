import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Loader2, X, ChevronRight, Play, Pause, RotateCcw, Check } from "lucide-react";
import { useFocusFunnel } from "@workspace/api-client-react";
import type { WeatherData } from "@workspace/api-client-react/src/generated/api.schemas";

interface FocusFunnelPanelProps {
  sessionId: string;
  weather: WeatherData | undefined;
}

const TIMER_PRESETS = [
  { label: "15 min", seconds: 15 * 60 },
  { label: "25 min", seconds: 25 * 60 },
  { label: "45 min", seconds: 45 * 60 },
];

export function FocusFunnelPanel({ sessionId, weather }: FocusFunnelPanelProps) {
  const [tasks, setTasks] = useState(["", "", ""]);
  const [result, setResult] = useState<{ task: string; reason: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [taskDone, setTaskDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusMutation = useFocusFunnel();

  const updateTask = (i: number, val: string) => {
    const t = [...tasks];
    t[i] = val;
    setTasks(t);
  };

  const filledTasks = tasks.filter((t) => t.trim().length > 0);

  const getFocusTask = async () => {
    if (filledTasks.length === 0) return;
    setError(null);
    try {
      const data = await focusMutation.mutateAsync({
        data: {
          sessionId,
          tasks: filledTasks,
          weatherDescription: weather?.description,
          uvIndex: weather?.uvIndex,
          sunlightHours: weather?.sunlightHours,
        },
      });
      setResult(data);
    } catch {
      setError("Couldn't reach Asha. Try again.");
    }
  };

  const startTimer = (seconds: number) => {
    setTimerSeconds(seconds);
    setTimerRemaining(seconds);
    setTimerRunning(true);
  };

  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimerRemaining((r) => {
          if (r <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerRunning, timerRemaining]);

  const toggleTimer = () => setTimerRunning((r) => !r);

  const resetTimer = () => {
    setTimerRunning(false);
    if (timerSeconds) setTimerRemaining(timerSeconds);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setResult(null);
    setTasks(["", "", ""]);
    setTimerSeconds(null);
    setTimerRemaining(0);
    setTimerRunning(false);
    setTaskDone(false);
  };

  const progress = timerSeconds ? 1 - timerRemaining / timerSeconds : 0;
  const CIRCUMFERENCE = 2 * Math.PI * 52;

  return (
    <div className="flex flex-col h-full px-7 pt-3 pb-16 overflow-y-auto">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex items-center gap-3 mb-5">
              <Target size={20} className="text-violet-400/60" />
              <div>
                <p className="text-sm text-white/70 font-medium">One-Task Mode</p>
                <p className="text-[10px] text-white/30 mt-0.5">What's on your plate? Asha picks the right one.</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {tasks.map((task, i) => (
                <div key={i} className="relative">
                  <input
                    type="text"
                    placeholder={i === 0 ? "Most urgent task" : i === 1 ? "Second task" : "Third task (optional)"}
                    value={task}
                    onChange={(e) => updateTask(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (i < 2) document.getElementById(`task-${i + 1}`)?.focus();
                        else if (filledTasks.length > 0) getFocusTask();
                      }
                    }}
                    id={`task-${i}`}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-violet-500/40 transition-colors pr-10"
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
              disabled={focusMutation.isPending || filledTasks.length === 0}
              className="w-full py-3.5 rounded-2xl bg-violet-600/60 border border-violet-500/20 text-white font-display text-sm tracking-widest uppercase hover:bg-violet-600/80 active:scale-95 transition-all disabled:opacity-30 flex justify-center items-center gap-2"
            >
              {focusMutation.isPending ? (
                <><Loader2 size={16} className="animate-spin" /> Reading your energy...</>
              ) : (
                <>Find my task <ChevronRight size={16} /></>
              )}
            </button>

            {error && <p className="text-xs text-red-400/60 mt-3 text-center">{error}</p>}

            <div className="mt-6 space-y-3">
              <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/20">Quick focus — no AI</p>
              <div className="flex gap-2">
                {TIMER_PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    onClick={() => {
                      const t = filledTasks[0] || "Focus session";
                      setResult({ task: t, reason: "You chose to focus. That's already progress." });
                      startTimer(preset.seconds);
                    }}
                    className="flex-1 py-3 rounded-xl bg-white/4 border border-white/8 text-xs text-white/40 font-display tracking-wider hover:bg-white/8 active:scale-95 transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 px-4 py-3 rounded-xl bg-white/3 border border-white/6">
                <p className="text-[10px] font-display tracking-wider text-white/25 mb-2 uppercase">Focus techniques</p>
                <div className="space-y-2">
                  {[
                    { name: "Body double", tip: "Work alongside someone (even on video call)" },
                    { name: "2-minute rule", tip: "If it takes < 2 min, do it now" },
                    { name: "Environment shift", tip: "Change rooms or put on different music" },
                    { name: "Shrink the task", tip: "Make it embarrassingly small to start" },
                  ].map((t) => (
                    <div key={t.name} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-violet-500/30 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] text-white/40 font-medium">{t.name}</span>
                        <span className="text-[10px] text-white/20"> — {t.tip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 pt-2 text-center"
          >
            {!timerSeconds ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-violet-500/20 border border-violet-400/30 flex items-center justify-center"
                >
                  <Target size={28} className="text-violet-400" />
                </motion.div>

                <div className="space-y-3 max-w-[280px]">
                  <p className="text-[10px] font-display tracking-[0.35em] uppercase text-white/25">Start with this</p>
                  <p className="text-xl font-sans font-light text-white leading-snug">
                    {result.task}
                  </p>
                  <p className="text-sm text-white/40 leading-relaxed mt-3">
                    {result.reason}
                  </p>
                </div>

                <div className="w-full space-y-2 mt-2">
                  <p className="text-[10px] font-display tracking-widest uppercase text-white/25 mb-3">Set a focus timer</p>
                  <div className="flex gap-3 justify-center">
                    {TIMER_PRESETS.map((preset) => (
                      <button
                        key={preset.seconds}
                        onClick={() => startTimer(preset.seconds)}
                        className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm text-white/60 font-display tracking-wider hover:bg-violet-500/15 hover:border-violet-500/25 active:scale-95 transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full space-y-2 opacity-30 mt-4">
                  <p className="text-[9px] font-display tracking-widest uppercase text-white/40 mb-2">Other tasks — waiting</p>
                  {filledTasks.filter(t => t !== result.task).map((t, i) => (
                    <div key={i} className="px-4 py-2.5 rounded-xl bg-white/3 border border-white/5 text-xs text-white/40 text-left">
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
              </>
            ) : (
              <>
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="white" strokeWidth="2" opacity="0.05" />
                    <motion.circle
                      cx="60" cy="60" r="52"
                      fill="none"
                      stroke={timerRemaining === 0 ? "hsl(140, 60%, 55%)" : "url(#timerGrad)"}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={CIRCUMFERENCE}
                      animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - progress) }}
                      transition={{ duration: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(270,70%,60%)" />
                        <stop offset="100%" stopColor="hsl(190,70%,50%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="text-center">
                    <p className="text-4xl font-display font-thin text-white tracking-wider">
                      {timerRemaining === 0 ? "Done!" : formatTime(timerRemaining)}
                    </p>
                    {timerRemaining > 0 && (
                      <p className="text-[9px] text-white/25 mt-1 font-display tracking-widest uppercase">
                        {timerRunning ? "Focusing..." : "Paused"}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm font-sans font-light text-white/60 max-w-[240px]">{result.task}</p>

                {timerRemaining > 0 ? (
                  <div className="flex gap-4">
                    <button
                      onClick={toggleTimer}
                      className="w-14 h-14 rounded-full bg-white/10 border border-white/15 flex items-center justify-center hover:bg-white/20 active:scale-90 transition-all"
                    >
                      {timerRunning ? <Pause size={22} className="text-white/70" /> : <Play size={22} className="text-white/70 ml-1" />}
                    </button>
                    <button
                      onClick={resetTimer}
                      className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 active:scale-90 transition-all"
                    >
                      <RotateCcw size={18} className="text-white/40" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {!taskDone && (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTaskDone(true)}
                          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 hover:bg-emerald-500/25 transition-all"
                        >
                          <Check size={20} />
                          <span className="text-sm font-display tracking-widest uppercase">Mark complete</span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                    {taskDone && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-2"
                      >
                        <p className="text-lg text-emerald-300/80 font-light">Great work.</p>
                        <p className="text-xs text-white/30">Momentum builds one task at a time.</p>
                      </motion.div>
                    )}
                    <button onClick={reset} className="text-xs text-white/25 underline hover:text-white/50 transition-colors">
                      New session
                    </button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
