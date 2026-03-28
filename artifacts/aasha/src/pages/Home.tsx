import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orb } from "@/components/Orb";
import { CheckinFlow } from "@/components/CheckinFlow";
import { InsightsView } from "@/components/InsightsView";
import { Onboarding } from "@/components/Onboarding";
import { ProfilePanel, ProfileButton } from "@/components/ProfilePanel";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { useWeatherSync } from "@/hooks/use-weather-sync";
import { ChevronUp } from "lucide-react";

type AppState = "home" | "checkin" | "insights";

export default function Home() {
  const sessionId = useSession();
  const { profile, isLoaded, saveProfile, clearProfile } = useProfile();
  const { weather, isSolarMode } = useWeatherSync();
  const [appState, setAppState] = useState<AppState>("home");
  const [holdData, setHoldData] = useState({ durationMs: 0, latencyMs: 0 });
  const [postCheckinNote, setPostCheckinNote] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const touchStartY = useRef(0);

  const handleCheckinTrigger = (durationMs: number, latencyMs: number) => {
    setHoldData({ durationMs, latencyMs });
    setAppState("checkin");
  };

  const handleCheckinComplete = (note?: string) => {
    if (note) setPostCheckinNote(note);
    setAppState("insights");
  };

  const handleSwipeAreaTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleSwipeAreaTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (diff > 40) setAppState("insights");
  };

  const handleSignOut = () => {
    clearProfile();
    setProfileOpen(false);
    setAppState("home");
  };

  if (!sessionId || !isLoaded) return null;

  if (!profile) {
    return <Onboarding onComplete={saveProfile} />;
  }

  const tintHue = profile.tintHue ?? 270;

  return (
    <div className="relative min-h-[100dvh] w-full bg-background overflow-hidden text-foreground flex flex-col">
      <style>{`
        :root {
          --tint-hue: ${tintHue};
        }
      `}</style>

      <div
        className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/bioluminescent-texture.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${10 + (i * 7.5) % 80}%`,
              top: `${15 + (i * 11) % 70}%`,
              background: `hsla(${tintHue}, 60%, 50%, 0.4)`,
            }}
            animate={{ y: [-10, 10, -10], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}
      </div>

      {appState === "home" && (
        <div className="absolute top-5 right-5 z-20">
          <ProfileButton profile={profile} onClick={() => setProfileOpen(true)} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {appState === "home" && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            transition={{ duration: 0.6 }}
            className="flex-1 flex flex-col items-center justify-between w-full py-12"
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.4, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-display tracking-[0.4em] text-white/40 uppercase"
            >
              Aasha · आशा
            </motion.div>

            <div className="flex-1 flex items-center justify-center w-full">
              <Orb isSolarMode={isSolarMode} onCheckinTrigger={handleCheckinTrigger} />
            </div>

            <div
              className="flex flex-col items-center gap-2 pb-2 cursor-pointer select-none"
              onClick={() => setAppState("insights")}
              onTouchStart={handleSwipeAreaTouchStart}
              onTouchEnd={handleSwipeAreaTouchEnd}
            >
              <motion.div
                animate={{ y: [0, -6, 0], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors"
              >
                <ChevronUp size={22} />
                <span className="text-[10px] font-display tracking-[0.25em] uppercase">Insights</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {appState === "checkin" && (
          <CheckinFlow
            key="checkin"
            sessionId={sessionId}
            lat={null}
            lon={null}
            holdDurationMs={holdData.durationMs}
            interactionLatencyMs={holdData.latencyMs}
            onComplete={handleCheckinComplete}
          />
        )}

        {appState === "insights" && (
          <InsightsView
            key="insights"
            sessionId={sessionId}
            weather={weather}
            postCheckinNote={postCheckinNote}
            userName={profile.name}
            onClose={() => {
              setPostCheckinNote(null);
              setAppState("home");
            }}
          />
        )}
      </AnimatePresence>

      <ProfilePanel
        profile={profile}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSave={saveProfile}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
