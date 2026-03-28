import { useGetCommunityPulse } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PulsePanel() {
  const { data: pulse, isLoading } = useGetCommunityPulse({
    query: { staleTime: 1000 * 60 * 5, refetchOnMount: true },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-[10px] font-display tracking-[0.3em] uppercase">Sensing the pulse...</p>
      </div>
    );
  }

  const percentage = pulse?.percentageDarkStretch ?? 0;
  const CIRCUMFERENCE = 2 * Math.PI * 54;

  // Heatmap-style dots for community visualization
  const totalDots = 48;
  const darkDots = Math.round((percentage / 100) * totalDots);

  return (
    <div className="flex flex-col items-center px-7 pt-4 pb-16 gap-10">
      {/* Ring */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="white" strokeWidth="2" opacity="0.05" />
          <motion.circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="url(#pulseGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - percentage / 100) }}
            transition={{ duration: 2.5, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(270,70%,60%)" />
              <stop offset="100%" stopColor="hsl(190,70%,50%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-4xl font-display font-thin text-white"
          >
            {Math.round(percentage)}%
          </motion.p>
          <p className="text-[9px] font-display tracking-widest uppercase text-white/30 mt-1">in dark stretch</p>
        </div>
      </div>

      {/* Dot heatmap */}
      <div className="w-full">
        <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/20 mb-4 text-center">Community tonight</p>
        <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto">
          {Array.from({ length: totalDots }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02, duration: 0.3 }}
              className={`w-3 h-3 rounded-full transition-colors ${
                i < darkDots
                  ? "bg-violet-500/60 shadow-[0_0_6px_rgba(139,92,246,0.4)]"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <p className="text-[9px] text-white/20 text-center mt-3">Each dot = one person</p>
      </div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-4 max-w-xs"
      >
        <p className="text-base font-sans font-light text-white/75 leading-relaxed">
          {pulse?.message ?? "Many are navigating a heavy stretch right now."}
        </p>
        <p className="text-[10px] font-display tracking-[0.4em] uppercase text-white/25">
          You are not alone
        </p>
      </motion.div>

      {/* Stats */}
      <div className="flex gap-6 w-full justify-center">
        <Stat label="Active" value={`${pulse?.totalUsers ?? 0}`} />
        <Stat label="Avg masking" value={`${pulse?.averageMaskingLevel?.toFixed(1) ?? "—"}/5`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-xl font-display font-light text-white/70">{value}</p>
      <p className="text-[9px] font-display tracking-widest uppercase text-white/25 mt-1">{label}</p>
    </div>
  );
}
