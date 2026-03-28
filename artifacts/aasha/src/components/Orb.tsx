import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbProps {
  isSolarMode: boolean;
  onCheckinTrigger: (durationMs: number, latencyMs: number) => void;
}

const BREATH_IN = 4000;
const BREATH_HOLD = 7000;
const BREATH_OUT = 8000;
const CYCLE_TOTAL = BREATH_IN + BREATH_HOLD + BREATH_OUT;

function getBreathPhaseLabel(elapsed: number): { label: string; phase: "in" | "hold" | "out" } {
  const cyclePos = elapsed % CYCLE_TOTAL;
  if (cyclePos < BREATH_IN) return { label: "Breathe in", phase: "in" };
  if (cyclePos < BREATH_IN + BREATH_HOLD) return { label: "Hold", phase: "hold" };
  return { label: "Breathe out", phase: "out" };
}

export function Orb({ isSolarMode, onCheckinTrigger }: OrbProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [breathPhase, setBreathPhase] = useState(0);
  const [breathLabel, setBreathLabel] = useState<{ label: string; phase: "in" | "hold" | "out" }>({ label: "Breathe in", phase: "in" });

  const holdStartTime = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const movementLatencies = useRef<number[]>([]);
  const animationFrame = useRef<number>(0);
  const breathFrame = useRef<number>(0);
  const holdActive = useRef(false);

  useEffect(() => {
    let start = Date.now();
    const animate = () => {
      const elapsed = (Date.now() - start) / 1000;
      setBreathPhase(Math.sin(elapsed * 0.5) * 0.5 + 0.5);
      breathFrame.current = requestAnimationFrame(animate);
    };
    breathFrame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(breathFrame.current);
  }, []);

  const startHold = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    holdActive.current = true;
    setIsHolding(true);
    setProgress(0);
    holdStartTime.current = Date.now();
    lastMoveTime.current = Date.now();
    movementLatencies.current = [];

    const tick = () => {
      if (!holdActive.current) return;
      const elapsed = Date.now() - holdStartTime.current;
      const p = Math.min(elapsed / 10000, 1);
      setProgress(p);
      setBreathLabel(getBreathPhaseLabel(elapsed));
      if (p < 1) {
        animationFrame.current = requestAnimationFrame(tick);
      } else {
        holdActive.current = false;
        setIsHolding(false);
        const avgLatency =
          movementLatencies.current.length > 0
            ? movementLatencies.current.reduce((a, b) => a + b, 0) / movementLatencies.current.length
            : 400;
        onCheckinTrigger(elapsed, avgLatency);
      }
    };
    animationFrame.current = requestAnimationFrame(tick);
  }, [onCheckinTrigger]);

  const endHold = useCallback(() => {
    holdActive.current = false;
    setIsHolding(false);
    setProgress(0);
    cancelAnimationFrame(animationFrame.current);
  }, []);

  const trackMove = useCallback((e: React.PointerEvent) => {
    if (!holdActive.current) return;
    const now = Date.now();
    const latency = now - lastMoveTime.current;
    if (latency > 0 && latency < 2000) {
      movementLatencies.current.push(latency);
    }
    lastMoveTime.current = now;
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrame.current);
      cancelAnimationFrame(breathFrame.current);
    };
  }, []);

  const breathScale = 1 + breathPhase * 0.06;
  const holdBreathScale = (() => {
    if (!isHolding) return breathScale;
    const elapsed = Date.now() - holdStartTime.current;
    const cyclePos = elapsed % CYCLE_TOTAL;
    if (cyclePos < BREATH_IN) {
      return 0.88 + (cyclePos / BREATH_IN) * 0.12;
    } else if (cyclePos < BREATH_IN + BREATH_HOLD) {
      return 1.0;
    } else {
      const outProgress = (cyclePos - BREATH_IN - BREATH_HOLD) / BREATH_OUT;
      return 1.0 - outProgress * 0.12;
    }
  })();

  const CIRCUMFERENCE = 2 * Math.PI * 118;

  return (
    <div className="relative flex items-center justify-center w-72 h-72 select-none touch-none">
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 288 288"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx="144" cy="144" r="118" fill="none" stroke="white" strokeWidth="1" opacity="0.06" />
        <motion.circle
          cx="144"
          cy="144"
          r="118"
          fill="none"
          stroke={isSolarMode ? "hsl(var(--solar))" : "hsl(var(--accent))"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          style={{ filter: "blur(3px)" }}
        />
        <motion.circle
          cx="144"
          cy="144"
          r="118"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          opacity={0.6}
        />
      </svg>

      <motion.div
        className={cn(
          "absolute w-56 h-56 rounded-full opacity-20",
          isSolarMode ? "bg-solar" : "bg-accent"
        )}
        animate={{ scale: holdBreathScale * 1.15 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        style={{ filter: "blur(24px)" }}
      />

      <motion.div
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        onPointerCancel={endHold}
        onPointerMove={trackMove}
        animate={{ scale: holdBreathScale, filter: isHolding ? "brightness(1.4)" : "brightness(1)" }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={cn(
          "w-52 h-52 rounded-full cursor-pointer touch-none relative overflow-hidden",
          isSolarMode
            ? "bg-gradient-to-br from-solar via-orange-400 to-amber-500 shadow-[0_0_80px_-10px_hsl(var(--solar)/0.8)]"
            : "bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 shadow-[0_0_80px_-10px_rgba(139,92,246,0.8)]"
        )}
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-white/20 to-transparent" />
        <div className="absolute top-4 left-6 w-8 h-8 rounded-full bg-white/30 blur-lg" />
      </motion.div>

      <AnimatePresence mode="wait">
        {isHolding ? (
          <motion.div
            key={breathLabel.phase}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="absolute -bottom-16 text-center flex flex-col items-center gap-1"
          >
            <p className={cn(
              "text-sm font-display tracking-[0.25em] uppercase",
              breathLabel.phase === "in" ? "text-emerald-400/70" :
              breathLabel.phase === "hold" ? "text-violet-300/70" :
              "text-teal-400/70"
            )}>
              {breathLabel.label}
            </p>
            <p className="text-[9px] text-white/25 font-display tracking-widest">4-7-8</p>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute -bottom-14 text-center"
          >
            <p className="text-xs font-display tracking-[0.3em] text-white/50 uppercase">
              Hold to check in
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {isHolding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          className="absolute pointer-events-none text-white font-display text-sm tracking-widest"
        >
          {Math.round(progress * 100)}%
        </motion.div>
      )}
    </div>
  );
}
