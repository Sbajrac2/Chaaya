import { useGetGarden } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function GardenPanel({ sessionId }: { sessionId: string }) {
  const { data: garden, isLoading } = useGetGarden(
    { sessionId },
    { query: { enabled: !!sessionId, refetchOnMount: true } }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-[10px] font-display tracking-[0.3em] uppercase">Tending...</p>
      </div>
    );
  }

  const petals = garden?.totalPetals ?? 0;
  const displayPetals = Math.min(petals, 72);

  return (
    <div className="flex flex-col items-center justify-between h-full px-6 py-6 pb-10">
      {/* Resilience Bloom */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div className="relative w-72 h-72 flex items-center justify-center">
          {/* Petals using golden angle phyllotaxis */}
          {Array.from({ length: displayPetals }).map((_, i) => {
            const angle = i * 137.508; // golden angle in degrees
            const radius = 12 + Math.sqrt(i) * 14;
            const hue = (i * 17 + 200) % 360; // color variation
            const size = Math.max(6, 14 - i * 0.1);

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.75, scale: 1 }}
                transition={{ delay: Math.min(i * 0.04, 2), duration: 0.6, type: "spring", stiffness: 200 }}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  background: `hsla(${hue}, 80%, 65%, 0.8)`,
                  boxShadow: `0 0 ${size * 1.5}px hsla(${hue}, 80%, 65%, 0.4)`,
                  transform: `rotate(${angle}deg) translateY(-${radius}px)`,
                  transformOrigin: "center center",
                }}
              />
            );
          })}

          {/* Center bloom core */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                "0 0 30px rgba(139,92,246,0.4)",
                "0 0 50px rgba(139,92,246,0.7)",
                "0 0 30px rgba(139,92,246,0.4)",
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-500 to-teal-400 z-10"
          />

          {/* Glow backdrop */}
          {petals > 0 && (
            <div
              className="absolute inset-0 rounded-full opacity-15"
              style={{
                background: "radial-gradient(circle, hsl(270,80%,60%) 0%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="text-center space-y-2">
        <motion.p
          key={petals}
          initial={{ scale: 1.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-display font-thin text-white"
        >
          {petals}
        </motion.p>
        <p className="text-[10px] font-display tracking-[0.4em] uppercase text-white/30">
          Petals of Resilience
        </p>
        {petals === 0 && (
          <p className="text-xs text-white/25 mt-4 max-w-[200px] mx-auto leading-relaxed">
            Hold the stone to earn your first petal. They never disappear.
          </p>
        )}
        {petals > 0 && (
          <p className="text-xs text-white/25 mt-2">
            {petals === 1 ? "First bloom. The hardest step." : `${petals} moments of showing up.`}
          </p>
        )}
      </div>
    </div>
  );
}
