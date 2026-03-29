import { useGetGarden } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";



function FlowerSVG({ petals, size }: { petals: number; size: number }) {
  const score = Math.min(petals, 5); // Max 5 petals per flower
  const hue = score >= 3 ? 160 + score * 20 : 270 + score * 15;
  const sat = 55 + score * 8;
  const light = 50 + score * 5;
  const petalCount = Math.max(1, petals); // At least 1 petal

  const stemHeight = size * 0.5;
  const centerR = size * 0.12;
  const petalR = size * (0.18 + score * 0.03);

  return (
    <div className="relative" style={{ width: size, height: size + stemHeight }}>
      <svg width={size} height={size + stemHeight} viewBox={`0 0 ${size} ${size + stemHeight}`}>
        <line
          x1={size / 2} y1={size * 0.7} x2={size / 2} y2={size + stemHeight - 4}
          stroke={`hsla(140, 40%, ${35 + score * 5}%, 0.6)`}
          strokeWidth={2}
          strokeLinecap="round"
        />
        {score >= 2 && (
          <ellipse
            cx={size / 2 + 6} cy={size * 0.85}
            rx={4} ry={6}
            fill={`hsla(140, 50%, 40%, 0.4)`}
            transform={`rotate(25 ${size / 2 + 6} ${size * 0.85})`}
          />
        )}

        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (360 / petalCount) * i - 90;
          const rad = (angle * Math.PI) / 180;
          const px = size / 2 + Math.cos(rad) * petalR * 0.6;
          const py = size * 0.45 + Math.sin(rad) * petalR * 0.6;
          return (
            <ellipse
              key={i}
              cx={px} cy={py}
              rx={petalR * 0.55} ry={petalR * 0.3}
              fill={`hsla(${hue + i * 8}, ${sat}%, ${light}%, ${0.6 + score * 0.08})`}
              transform={`rotate(${angle} ${px} ${py})`}
            />
          );
        })}

        <circle
          cx={size / 2} cy={size * 0.45}
          r={centerR}
          fill={`hsla(${hue - 20}, 70%, 70%, 0.9)`}
        />

        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}

export function GardenPanel({ sessionId }: { sessionId: string }) {
  const { data: garden, isLoading } = useGetGarden(
    { sessionId },
    { query: { enabled: !!sessionId, refetchOnMount: true, retry: false, placeholderData: { recentCheckins: [], totalPetals: 0, currentStreak: 0 }, queryKey: ['garden', sessionId] } }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-[10px] font-display tracking-[0.3em] uppercase">Growing...</p>
      </div>
    );
  }

  const checkins = garden?.recentCheckins ?? [];
  const totalPetals = checkins.length; // Each checkin is a petal
  const totalFlowers = Math.floor(totalPetals / 5); // 5 petals = 1 flower
  const currentPetals = totalPetals % 5; // Petals in current flower
  const streak = garden?.currentStreak ?? 0;

  // Achievements: each flower unlocks an achievement
  const achievements = [
    { id: 1, name: "First Bloom", description: "Your first flower! 🌸 Planted a seed in reforestation project.", unlocked: totalFlowers >= 1 },
    { id: 2, name: "Garden Guardian", description: "Second flower! 🌿 Supported mental health hotline with donation.", unlocked: totalFlowers >= 2 },
    { id: 3, name: "Flora Friend", description: "Third flower! 🌺 Contributed to crisis prevention fund.", unlocked: totalFlowers >= 3 },
    { id: 4, name: "Bloom Master", description: "Fourth flower! 🌻 Helped plant urban green spaces.", unlocked: totalFlowers >= 4 },
    { id: 5, name: "Eternal Garden", description: "Fifth flower! 🌹 Ongoing support for mental wellness programs.", unlocked: totalFlowers >= 5 },
  ];

  return (
    <div className="flex flex-col h-full px-5 pt-3 pb-16 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/25">Your Garden</p>
          <p className="text-xs text-white/40 mt-0.5">
            {totalPetals} petal{totalPetals !== 1 ? "s" : ""} · {totalFlowers} flower{totalFlowers !== 1 ? "s" : ""} · {streak} day streak
          </p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-2xl"
        >
          🌱
        </motion.div>
      </div>

      {totalPetals === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-3xl opacity-40">🌱</span>
          </div>
          <p className="text-xs text-white/30 text-center max-w-[200px] leading-relaxed">
            Hold the stone to plant your first petal. Each check-in grows your garden.
          </p>
        </div>
      ) : (
        <>
          {/* Current Flower in Progress */}
          <div className="bg-gradient-to-b from-transparent via-emerald-950/10 to-emerald-950/20 rounded-2xl border border-white/5 p-4 mb-4">
            <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/25 mb-3">
              Current Flower ({currentPetals}/5 petals)
            </p>
            <div className="flex justify-center">
              <FlowerSVG petals={currentPetals} size={80} />
            </div>
          </div>

          {/* Completed Flowers */}
          {totalFlowers > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/25 mb-3">
                Bloomed Flowers ({totalFlowers})
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {Array.from({ length: totalFlowers }).map((_, i) => (
                  <FlowerSVG key={i} petals={5} size={50} />
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          <div className="space-y-2">
            <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/25">Achievements</p>
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: achievement.unlocked ? 1 : 0.3 }}
                className={`p-3 rounded-xl border ${
                  achievement.unlocked
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-lg ${achievement.unlocked ? "opacity-100" : "opacity-40"}`}>
                    {achievement.unlocked ? "🏆" : "🔒"}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      achievement.unlocked ? "text-emerald-300" : "text-white/40"
                    }`}>
                      {achievement.name}
                    </p>
                    <p className={`text-[10px] ${
                      achievement.unlocked ? "text-emerald-200/60" : "text-white/30"
                    }`}>
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}


    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
      good ? "bg-emerald-500/8 border-emerald-500/15" : "bg-white/3 border-white/5"
    }`}>
      <div className={`w-2 h-2 rounded-full ${good ? "bg-emerald-400/60" : "bg-white/20"}`} />
      <span className={`text-[10px] ${good ? "text-emerald-300/60" : "text-white/30"}`}>{label}</span>
    </div>
  );
}
