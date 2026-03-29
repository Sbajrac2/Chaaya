import { useState, useCallback } from "react";
import { useGetCommunityPulse } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Heart, Users, Sparkles } from "lucide-react";

export function PulsePanel() {
  const { data: pulse, isLoading } = useGetCommunityPulse({
    query: { staleTime: 1000 * 60 * 5, refetchOnMount: true, queryKey: ['communityPulse'] },
  });
  const [sentLight, setSentLight] = useState(false);
  const [lightCount, setLightCount] = useState(0);
  const [tappedDots, setTappedDots] = useState<Set<number>>(new Set());
  const [showRipple, setShowRipple] = useState(false);

  const percentage = pulse?.percentageDarkStretch ?? 0;
  const CIRCUMFERENCE = 2 * Math.PI * 54;
  const totalDots = 36;
  const darkDots = Math.round((percentage / 100) * totalDots);

  const handleDotTap = useCallback((index: number) => {
    if (index < darkDots && !tappedDots.has(index)) {
      const next = new Set(tappedDots);
      next.add(index);
      setTappedDots(next);
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 1000);
    }
  }, [darkDots, tappedDots]);

  const handleSendLight = useCallback(() => {
    if (!sentLight) {
      setSentLight(true);
      setLightCount(prev => prev + 1);
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 1500);
    }
  }, [sentLight]);

  const resetLight = useCallback(() => {
    setSentLight(false);
    setTappedDots(new Set());
  }, []);

  return (
    <div className="flex flex-col items-center px-7 pt-3 pb-16 gap-5 overflow-y-auto">
      <div className="w-full px-1">
        <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20 mb-1">Community Pulse</p>
        <p className="text-xs text-white/35 leading-relaxed">
          A gentle snapshot of how our community is feeling today. Your presence matters — you're part of something bigger.
        </p>
      </div>

      {/* Main Pulse Indicator */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 120 120"
          style={{ transform: "rotate(-90deg)" }}
          role="img"
          aria-label={`Community pulse: ${Math.round(percentage)}% experiencing challenges`}
        >
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

        {/* Ripple effect when sending light */}
        <AnimatePresence>
          {showRipple && (
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-full border-2 border-amber-400/30"
            />
          )}
        </AnimatePresence>

        <div className="text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-3xl font-display font-thin text-white"
          >
            {Math.round(percentage)}%
          </motion.p>
          <p className="text-[9px] font-display tracking-widest uppercase text-white/30 mt-1">
            seeking support
          </p>
        </div>
      </div>

      {/* Community Interaction */}
      <div className="w-full">
        <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/20 mb-3 text-center">
          Send light to those who need it
        </p>
        <div
          className="flex flex-wrap gap-3 justify-center max-w-xs mx-auto"
          role="group"
          aria-label="Community members seeking support"
        >
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
                disabled={!isDark || wasTapped}
                className={`w-5 h-5 rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
                  wasTapped
                    ? "bg-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-110"
                    : isDark
                    ? "bg-violet-500/60 shadow-[0_0_8px_rgba(139,92,246,0.4)] hover:bg-violet-400/70 hover:scale-105 cursor-pointer"
                    : "bg-white/15"
                }`}
                aria-label={
                  wasTapped
                    ? "Light sent to this community member"
                    : isDark
                    ? "Tap to send light to this community member"
                    : "Community member doing well"
                }
              />
            );
          })}
        </div>

        <AnimatePresence>
          {tappedDots.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-center mt-4"
            >
              <p className="text-[10px] text-amber-400/70 mb-2">
                ✨ You sent light to {tappedDots.size} {tappedDots.size === 1 ? "person" : "people"}
              </p>
              <button
                onClick={resetLight}
                className="text-[9px] text-white/40 hover:text-white/60 underline"
              >
                Send more light
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Community Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-3 max-w-xs"
      >
        <p className="text-sm font-sans font-light text-white/65 leading-relaxed">
          {pulse?.message ?? "We're all in this together. Your kindness creates ripples of hope."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <Users size={12} className="text-white/30" />
          <p className="text-[10px] font-display tracking-[0.4em] uppercase text-white/25">
            Together we heal
          </p>
        </div>
      </motion.div>

      {/* Share Light Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleSendLight}
        disabled={sentLight}
        className={`flex items-center gap-3 px-8 py-4 rounded-2xl border transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 ${
          sentLight
            ? "bg-amber-500/15 border-amber-500/30 cursor-not-allowed"
            : "bg-white/5 border-white/15 hover:bg-violet-500/10 hover:border-violet-500/20 active:bg-violet-500/15"
        }`}
        aria-label={sentLight ? "Light already shared today" : "Share your light with the community"}
      >
        <motion.div
          animate={sentLight ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.8 }}
        >
          <Heart
            size={20}
            className={sentLight ? "text-amber-400 fill-amber-400" : "text-white/40"}
          />
        </motion.div>
        <span className={`text-sm font-display tracking-widest uppercase ${
          sentLight ? "text-amber-300/80" : "text-white/50"
        }`}>
          {sentLight ? "Light shared ✨" : "Share light"}
        </span>
      </motion.button>

      {/* Community Stats */}
      <div className="flex gap-8 w-full justify-center mt-2">
        <Stat
          icon={<Users size={14} />}
          label="Active today"
          value={`${pulse?.totalUsers ?? 0}`}
        />
        <Stat
          icon={<Sparkles size={14} />}
          label="Avg wellness"
          value={`${pulse?.averageMaskingLevel ? (6 - pulse.averageMaskingLevel).toFixed(1) : "—"}/5`}
        />
        {sentLight && (
          <Stat
            icon={<Heart size={14} />}
            label="Lights shared"
            value={`${lightCount}`}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="text-center flex flex-col items-center gap-1">
      <div className="text-white/30">{icon}</div>
      <p className="text-lg font-display font-light text-white/60">{value}</p>
      <p className="text-[9px] font-display tracking-widest uppercase text-white/25">{label}</p>
    </div>
  );
}
