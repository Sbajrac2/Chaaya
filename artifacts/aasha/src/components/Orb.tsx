import { useState, useRef, useEffect } from "react";
import { motion, useAnimation, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

interface OrbProps {
  isSolarMode: boolean;
  onCheckinTrigger: (durationMs: number, latencyMs: number) => void;
}

export function Orb({ isSolarMode, onCheckinTrigger }: OrbProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Tracking logic
  const holdStartTime = useRef<number>(0);
  const lastMoveTime = useRef<number>(0);
  const movementLatencies = useRef<number[]>([]);
  const animationFrame = useRef<number>(0);

  const orbColorClass = isSolarMode ? "orb-gradient-solar shadow-solar/40" : "orb-gradient-violet shadow-primary/40";
  const glowColor = isSolarMode ? "hsl(var(--solar))" : "hsl(var(--primary))";

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault(); // prevent scroll
    setIsHolding(true);
    setProgress(0);
    holdStartTime.current = Date.now();
    lastMoveTime.current = Date.now();
    movementLatencies.current = [];
    
    const animateProgress = () => {
      const elapsed = Date.now() - holdStartTime.current;
      const currentProgress = Math.min(elapsed / 10000, 1); // 10 seconds
      setProgress(currentProgress);
      
      if (currentProgress < 1) {
        animationFrame.current = requestAnimationFrame(animateProgress);
      } else {
        // Trigger checkin
        setIsHolding(false);
        const totalDuration = Date.now() - holdStartTime.current;
        const avgLatency = movementLatencies.current.length 
          ? movementLatencies.current.reduce((a, b) => a + b, 0) / movementLatencies.current.length
          : 0;
        
        onCheckinTrigger(totalDuration, avgLatency);
      }
    };
    
    animationFrame.current = requestAnimationFrame(animateProgress);
  };

  const handlePointerUp = () => {
    setIsHolding(false);
    setProgress(0);
    cancelAnimationFrame(animationFrame.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isHolding) return;
    const now = Date.now();
    const latency = now - lastMoveTime.current;
    if (latency > 0) {
      movementLatencies.current.push(latency);
    }
    lastMoveTime.current = now;
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationFrame.current);
  }, []);

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto select-none touch-none">
      {/* Progress Ring */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 256 256">
        <circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white/5"
        />
        <motion.circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke={glowColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="753.98" // 2 * PI * 120
          strokeDashoffset={753.98 * (1 - progress)}
          className="transition-all duration-75 ease-linear"
          style={{ filter: "blur(2px)" }}
        />
        <motion.circle
          cx="128"
          cy="128"
          r="120"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="753.98"
          strokeDashoffset={753.98 * (1 - progress)}
          className="transition-all duration-75 ease-linear mix-blend-overlay"
        />
      </svg>

      {/* The Stone */}
      <motion.div
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
        animate={{
          scale: isHolding ? 0.95 : 1,
          filter: isHolding ? "brightness(1.3)" : "brightness(1)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={cn(
          "w-48 h-48 rounded-full cursor-pointer",
          "shadow-[0_0_60px_-10px_currentColor]",
          "animate-breathe transition-colors duration-1000",
          orbColorClass
        )}
      >
        <div className="w-full h-full rounded-full bg-black/10 backdrop-blur-sm mix-blend-overlay"></div>
      </motion.div>
      
      {/* Instruction text (fades out when holding) */}
      <motion.div 
        animate={{ opacity: isHolding ? 0 : 0.4 }}
        className="absolute -bottom-16 text-sm font-display tracking-widest text-foreground text-center"
      >
        HOLD TO CHECK IN
      </motion.div>
    </div>
  );
}
