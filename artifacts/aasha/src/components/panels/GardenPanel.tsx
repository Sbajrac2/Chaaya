import { useGetGarden } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function GardenPanel({ sessionId }: { sessionId: string }) {
  const { data: garden, isLoading } = useGetGarden({ sessionId }, { 
    query: { enabled: !!sessionId, staleTime: 0 } 
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        <p className="font-display tracking-widest text-sm uppercase">Tending Garden...</p>
      </div>
    );
  }

  const petals = garden?.totalPetals || 0;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6">
      <div className="flex-1 flex items-center justify-center w-full relative">
        {/* Generative Flower Visualization */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          {Array.from({ length: Math.min(petals, 50) }).map((_, i) => {
            const angle = (i * 137.5) % 360; // Golden angle for natural distribution
            const radius = Math.sqrt(i) * 12; // Spiral outwards
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.8, type: "spring" }}
                className="absolute w-6 h-6 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30 mix-blend-screen shadow-[0_0_10px_hsl(var(--primary)/0.2)]"
                style={{
                  transform: `rotate(${angle}deg) translateX(${radius}px) rotate(${angle}deg)`,
                  transformOrigin: "center center"
                }}
              />
            );
          })}
          
          <motion.div 
            animate={{ scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-accent to-primary shadow-[0_0_40px_hsl(var(--accent)/0.5)] z-10"
          />
        </div>
      </div>
      
      <div className="pb-24 pt-8 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-display font-light text-white mb-2"
        >
          {petals}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground font-display tracking-widest uppercase text-sm"
        >
          Petals of Resilience
        </motion.p>
      </div>
    </div>
  );
}
