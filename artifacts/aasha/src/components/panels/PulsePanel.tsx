import { useState } from "react";
import { useGetCommunityPulse } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Heart } from "lucide-react";

export function PulsePanel() {
  const { data: pulse, isLoading } = useGetCommunityPulse({
    query: { staleTime: 1000 * 60 * 5, refetchOnMount: true },
  });
  const [sentLight, setSentLight] = useState(false);
  const [lightCount, setLightCount] = useState(0);
  const [tappedDots, setTappedDots] = useState<Set<number>>(new Set());

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
  const totalDots = 36;
  const darkDots = Math.round((percentage / 100) * totalDots);

  const handleDotTap = (index: number) => {
    if (index < darkDots && !tappedDots.has(index)) {
      const next = new Set(tappedDots);
      next.add(index);
      setTappedDots(next);
    }
  };

  const handleSendLight = () => {
    if (!sentLight) {
      setSentLight(true);
      setLightCount((c) => c + 1);
    }
  };

  return (
    <div className="flex flex-col items-center px-7 pt-3 pb-16 gap-6 overflow-y-auto">
      <div className="relative w-40 h-40 flex items-center justify-center">
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
            className="text-3xl font-display font-thin text-white"
          >
            {Math.round(percentage)}%
          </motion.p>
          <p className="text-[9px] font-display tracking-widest uppercase text-white/30 mt-1">in dark stretch</p>
        </div>
      </div>

      <div className="w-full">
        <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/20 mb-3 text-center">
          Community tonight — tap to send light
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-xs mx-auto">
          {Array.from({ length: totalDots }).map((_, i) => {
            const isDark = i < darkDots;
            const wasTapped = tappedDots.has(i);
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02, duration: 0.3 }}
                onClick={() => handleDotTap(i)}
                className={`w-4 h-4 rounded-full transition-all duration-500 ${
                  wasTapped
                    ? "bg-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.5)] scale-110"
                    : isDark
                    ? "bg-violet-500/50 shadow-[0_0_6px_rgba(139,92,246,0.3)] hover:bg-violet-400/60 cursor-pointer"
                    : "bg-white/10"
                }`}
              />
            );
          })}
        </div>
        {tappedDots.size > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-amber-400/50 text-center mt-3"
          >
            You sent light to {tappedDots.size} {tappedDots.size === 1 ? "person" : "people"}
          </motion.p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-3 max-w-xs"
      >
        <p className="text-sm font-sans font-light text-white/65 leading-relaxed">
          {pulse?.message ?? "Many are navigating a heavy stretch right now."}
        </p>
        <p className="text-[10px] font-display tracking-[0.4em] uppercase text-white/25">
          You are not alone
        </p>
      </motion.div>

      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={handleSendLight}
        disabled={sentLight}
        className={`flex items-center gap-3 px-7 py-4 rounded-2xl border transition-all duration-500 ${
          sentLight
            ? "bg-amber-500/15 border-amber-500/30"
            : "bg-white/5 border-white/15 hover:bg-violet-500/10 hover:border-violet-500/20"
        }`}
      >
        <motion.div
          animate={sentLight ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Heart
            size={20}
            className={sentLight ? "text-amber-400 fill-amber-400" : "text-white/40"}
          />
        </motion.div>
        <span className={`text-sm font-display tracking-widest uppercase ${
          sentLight ? "text-amber-300/80" : "text-white/50"
        }`}>
          {sentLight ? "Light sent" : "Share your light"}
        </span>
      </motion.button>

      <div className="flex gap-6 w-full justify-center mt-1">
        <Stat label="Active" value={`${pulse?.totalUsers ?? 0}`} />
        <Stat label="Avg masking" value={`${pulse?.averageMaskingLevel?.toFixed(1) ?? "—"}/5`} />
        {sentLight && <Stat label="Lights sent" value={`${lightCount}`} />}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-display font-light text-white/60">{value}</p>
      <p className="text-[9px] font-display tracking-widest uppercase text-white/25 mt-1">{label}</p>
    </div>
  );
}
