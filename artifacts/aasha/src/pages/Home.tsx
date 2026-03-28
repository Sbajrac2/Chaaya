import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orb } from "@/components/Orb";
import { CheckinFlow } from "@/components/CheckinFlow";
import { SwipeableView } from "@/components/SwipeableView";
import { useSession } from "@/hooks/use-session";
import { useWeatherSync } from "@/hooks/use-weather-sync";
import { ChevronUp } from "lucide-react";

type AppState = "home" | "checkin" | "insights";

export default function Home() {
  const sessionId = useSession();
  const { weather, isSolarMode } = useWeatherSync();
  const [appState, setAppState] = useState<AppState>("home");
  
  // Stored interaction data from the Orb hold
  const [holdData, setHoldData] = useState({ durationMs: 0, latencyMs: 0 });

  const handleCheckinTrigger = (durationMs: number, latencyMs: number) => {
    setHoldData({ durationMs, latencyMs });
    setAppState("checkin");
  };

  const handleCheckinComplete = () => {
    setAppState("insights");
  };

  if (!sessionId) return null; // Loading session

  return (
    <div className="relative min-h-[100dvh] w-full bg-background overflow-hidden text-foreground flex flex-col">
      {/* Abstract Background Texture */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-screen pointer-events-none"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/bioluminescent-texture.png)`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      
      <AnimatePresence mode="wait">
        {appState === "home" && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.8 }}
            className="flex-1 flex flex-col items-center justify-center relative w-full h-full"
            // Swipe up on home screen opens insights directly
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y < -50 && Math.abs(info.velocity.y) > Math.abs(info.velocity.x)) {
                setAppState("insights");
              }
            }}
          >
            <div className="flex-1 flex items-center justify-center w-full touch-none">
              <Orb isSolarMode={isSolarMode} onCheckinTrigger={handleCheckinTrigger} />
            </div>

            {/* Swipe up hint */}
            <motion.div 
              animate={{ y: [0, -5, 0], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-12 flex flex-col items-center gap-2 text-white/50 pointer-events-none"
            >
              <ChevronUp size={20} />
              <span className="text-[10px] font-display tracking-[0.2em] uppercase">Insights</span>
            </motion.div>
          </motion.div>
        )}

        {appState === "checkin" && (
          <CheckinFlow 
            key="checkin"
            sessionId={sessionId}
            lat={weather?.lat} // Pass coordinates if we have them from weather state
            lon={weather?.lon}
            holdDurationMs={holdData.durationMs}
            interactionLatencyMs={holdData.latencyMs}
            onComplete={handleCheckinComplete}
          />
        )}

        {appState === "insights" && (
          <SwipeableView 
            key="insights"
            sessionId={sessionId}
            weather={weather}
            onClose={() => setAppState("home")}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
