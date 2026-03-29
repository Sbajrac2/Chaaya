import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Flower2, Radio, Target, Eye, BarChart3 } from "lucide-react";
import { GardenPanel } from "./panels/GardenPanel";
import { PulsePanel } from "./panels/PulsePanel";
import { FocusFunnelPanel } from "./panels/FocusFunnelPanel";
import { ReflectionPanel } from "./panels/ReflectionPanel";
import { DashboardPanel } from "./panels/DashboardPanel";
import type { WeatherData } from "@workspace/api-client-react/src/generated/api.schemas";

interface InsightsViewProps {
  sessionId: string;
  weather: WeatherData | undefined;
  postCheckinNote: string | null;
  userName: string;
  onClose: () => void;
}

const TABS = [
  { id: "reflection", icon: Eye, label: "Reflection" },
  { id: "dashboard", icon: BarChart3, label: "Dashboard" },
  { id: "garden", icon: Flower2, label: "Garden" },
  { id: "pulse", icon: Radio, label: "Pulse" },
  { id: "focus", icon: Target, label: "Focus" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function InsightsView({ sessionId, weather, postCheckinNote, userName, onClose }: InsightsViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("reflection");

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;

    if (Math.abs(dy) > Math.abs(dx) && dy < -60) {
      onClose();
      return;
    }

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      const idx = TABS.findIndex((t) => t.id === activeTab);
      if (dx > 0 && idx < TABS.length - 1) setActiveTab(TABS[idx + 1].id);
      if (dx < 0 && idx > 0) setActiveTab(TABS[idx - 1].id);
    }
  };

  return (
    <motion.div
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className="fixed inset-0 z-40 bg-[#080f0c]/96 backdrop-blur-2xl flex flex-col"
    >
      <div
        onClick={onClose}
        className="flex flex-col items-center pt-5 pb-3 cursor-pointer group"
      >
        <div className="w-10 h-1 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors mb-1" />
        <ChevronDown size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
      </div>

      <div className="flex items-center justify-center gap-0.5 px-4 pb-3 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 flex-1 min-w-0 ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/60 hover:bg-white/5"
              }`}
            >
              <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[8px] font-display tracking-widest uppercase truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div
        className="flex-1 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatePresence mode="wait">
          {activeTab === "reflection" && (
            <Panel key="reflection">
              <ReflectionPanel sessionId={sessionId} userName={userName} />
            </Panel>
          )}
          {activeTab === "dashboard" && (
            <Panel key="dashboard">
              <DashboardPanel sessionId={sessionId} userName={userName} />
            </Panel>
          )}
          {activeTab === "garden" && (
            <Panel key="garden">
              <GardenPanel sessionId={sessionId} />
            </Panel>
          )}
          {activeTab === "pulse" && (
            <Panel key="pulse">
              <PulsePanel />
            </Panel>
          )}
          {activeTab === "focus" && (
            <Panel key="focus">
              <FocusFunnelPanel sessionId={sessionId} weather={weather} />
            </Panel>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="h-full w-full overflow-y-auto"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  );
}
