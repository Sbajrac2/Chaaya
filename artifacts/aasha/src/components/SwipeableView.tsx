import { useState, useRef } from "react";
import { motion, PanInfo } from "framer-motion";
import { GardenPanel } from "./panels/GardenPanel";
import { NotePanel } from "./panels/NotePanel";
import { PulsePanel } from "./panels/PulsePanel";
import type { WeatherData } from "@workspace/api-client-react/src/generated/api.schemas";

interface SwipeableViewProps {
  sessionId: string;
  weather: WeatherData | undefined;
  onClose: () => void;
}

export function SwipeableView({ sessionId, weather, onClose }: SwipeableViewProps) {
  const [panelIndex, setPanelIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const panels = [
    { id: "garden", component: <GardenPanel sessionId={sessionId} /> },
    { id: "note", component: <NotePanel sessionId={sessionId} weather={weather} /> },
    { id: "pulse", component: <PulsePanel /> }
  ];

  const handleDragEnd = (e: any, info: PanInfo) => {
    // Vertical swipe down to close
    if (info.offset.y > 100 && Math.abs(info.velocity.y) > Math.abs(info.velocity.x)) {
      onClose();
      return;
    }
    
    // Horizontal swipe to navigate panels
    if (Math.abs(info.offset.x) > 50) {
      if (info.offset.x > 0 && panelIndex > 0) {
        setPanelIndex(panelIndex - 1); // Swipe Right -> Go Left
      } else if (info.offset.x < 0 && panelIndex < panels.length - 1) {
        setPanelIndex(panelIndex + 1); // Swipe Left -> Go Right
      }
    }
  };

  return (
    <motion.div 
      initial={{ y: "100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-40 bg-background/95 backdrop-blur-2xl flex flex-col"
      ref={containerRef}
    >
      {/* Handle / Drag Indicator */}
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="w-full pt-8 pb-4 flex justify-center cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="w-12 h-1.5 rounded-full bg-white/20" />
      </motion.div>

      {/* Swipeable Content Area */}
      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="flex-1 relative overflow-hidden touch-none"
      >
        <div 
          className="absolute inset-y-0 flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${panels.length * 100}%`, transform: `translateX(-${(panelIndex / panels.length) * 100}%)` }}
        >
          {panels.map((panel, idx) => (
            <div key={panel.id} className="h-full relative" style={{ width: `${100 / panels.length}%` }}>
              <div className={`h-full w-full transition-opacity duration-500 ${idx === panelIndex ? 'opacity-100' : 'opacity-30'}`}>
                {panel.component}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-50">
        {panels.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === panelIndex ? 'w-6 bg-white/80' : 'w-1.5 bg-white/20'}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
