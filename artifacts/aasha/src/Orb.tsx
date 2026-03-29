import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckinFlow } from "./components/CheckinFlow";
import { useSession } from "@/hooks/use-session";
import { useGeolocation } from "@/hooks/use-weather-sync";

export function Orb() {
  const [isHolding, setIsHolding] = useState(false);
  const [holdDurationMs, setHoldDurationMs] = useState(0);
  const [interactionLatencyMs, setInteractionLatencyMs] = useState(0);
  const [showCheckinFlow, setShowCheckinFlow] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const sessionId = useSession();
  const coords = useGeolocation();
  const { lat, lon } = coords || { lat: 0, lon: 0 };

  const startHold = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setStartTime(Date.now());
    setIsHolding(true);
    setHoldDurationMs(0);
  }, []);

  const endHold = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (holdDurationMs >= 8000) {
      setShowCheckinFlow(true);
    }
    setIsHolding(false);
    setHoldDurationMs(0);
  }, [holdDurationMs]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isHolding) {
      timeout = setInterval(() => {
        const duration = Date.now() - startTime;
        setHoldDurationMs(duration);
        setInteractionLatencyMs(Math.random() * 200 + 100); // simulate micro-movements
      }, 100);
    }
    return () => clearInterval(timeout);
  }, [isHolding, startTime]);

  const holdSeconds = Math.floor(holdDurationMs / 1000);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-12">
      <motion.div
        className="relative group"
        onMouseDown={startHold}
        onMouseUp={endHold}
        onMouseLeave={endHold}
        onTouchStart={startHold}
        onTouchEnd={endHold}
        onTouchCancel={endHold}
      >
        <div className="w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-500/75 group-active:shadow-purple-500/50 relative overflow-hidden cursor-pointer">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-full"
            animate={{ rotate: holdDurationMs > 0 ? 360 : 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent rounded-full"
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {isHolding && holdSeconds >= 3 && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center text-3xl font-display tracking-widest text-white drop-shadow-lg"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-[1.8rem] mb-1">3</div>
              <div className="flex gap-4 mb-1 text-xl">
                <span>4</span>
                <span>4</span>
              </div>
              <motion.span
                className="text-xs uppercase tracking-wider mt-2"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Breathe → In → Hold → Out
              </motion.span>
            </motion.div>
          )}
        </div>
        {isHolding && (
          <motion.div
            className="absolute -bottom-8 text-center text-white/60 text-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            Hold for 8s to check in...
            <div className="text-xl font-mono mt-1">{holdSeconds}s</div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {showCheckinFlow && sessionId && (
          <CheckinFlow
            sessionId={sessionId}
            lat={lat}
            lon={lon}
            holdDurationMs={holdDurationMs}
            interactionLatencyMs={interactionLatencyMs}
            onComplete={() => {
              setShowCheckinFlow(false);
              setHoldDurationMs(0);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

