import { useState } from "react";
import { useGetGarden } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface FlowerData {
  date: string;
  dayLabel: string;
  attendedClass: boolean;
  ateWell: boolean;
  maskingLevel: number;
  leftRoom: boolean | null;
  isLateNight: boolean;
  count: number;
}

const FLOWER_SHAPES = [
  { petals: 5, name: "daisy" },
  { petals: 6, name: "lily" },
  { petals: 8, name: "lotus" },
  { petals: 4, name: "clover" },
];

function FlowerSVG({ data, size, onClick, isSelected }: {
  data: FlowerData; size: number;
  onClick: () => void; isSelected: boolean;
}) {
  const score = (data.attendedClass ? 1 : 0) + (data.ateWell ? 1 : 0) +
    (data.leftRoom ? 1 : 0) + (data.maskingLevel <= 2 ? 1 : 0);

  const hue = score >= 3 ? 160 + score * 20 : 270 + score * 15;
  const sat = 55 + score * 8;
  const light = 50 + score * 5;
  const petalCount = FLOWER_SHAPES[score % FLOWER_SHAPES.length].petals;

  const stemHeight = size * 0.5;
  const centerR = size * 0.12;
  const petalR = size * (0.18 + score * 0.03);

  return (
    <motion.div
      className="cursor-pointer relative"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{ width: size, height: size + stemHeight }}
    >
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
              filter={isSelected ? "url(#glow)" : undefined}
            />
          );
        })}

        <circle
          cx={size / 2} cy={size * 0.45}
          r={centerR}
          fill={`hsla(${hue - 20}, 70%, 70%, 0.9)`}
        />

        {isSelected && (
          <circle
            cx={size / 2} cy={size * 0.45}
            r={petalR + 4}
            fill="none"
            stroke="hsla(270, 80%, 70%, 0.4)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )}

        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>
    </motion.div>
  );
}

export function GardenPanel({ sessionId }: { sessionId: string }) {
  const { data: garden, isLoading } = useGetGarden(
    { sessionId },
    { query: { enabled: !!sessionId, refetchOnMount: true, retry: false, placeholderData: { recentCheckins: [], totalPetals: 0, currentStreak: 0 } } }
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-[10px] font-display tracking-[0.3em] uppercase">Growing...</p>
      </div>
    );
  }

  const checkins = garden?.recentCheckins ?? [];

  const byDay = new Map<string, FlowerData>();
  checkins.forEach((c) => {
    const d = new Date(c.createdAt);
    const key = d.toISOString().split("T")[0];
    const existing = byDay.get(key);
    if (!existing) {
      byDay.set(key, {
        date: key,
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
        attendedClass: c.attendedClass,
        ateWell: c.ateWell,
        maskingLevel: c.maskingLevel,
        leftRoom: (c as any).leftRoom ?? null,
        isLateNight: c.isLateNight,
        count: 1,
      });
    } else {
      existing.count++;
      if (c.attendedClass) existing.attendedClass = true;
      if (c.ateWell) existing.ateWell = true;
    }
  });

  const flowers = Array.from(byDay.values()).slice(0, 21);
  const selected = selectedDate ? byDay.get(selectedDate) : null;
  const totalPetals = garden?.totalPetals ?? 0;
  const streak = garden?.currentStreak ?? 0;

  return (
    <div className="flex flex-col h-full px-5 pt-3 pb-16 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/25">Your Garden</p>
          <p className="text-xs text-white/40 mt-0.5">
            {totalPetals} petal{totalPetals !== 1 ? "s" : ""} · {streak} day streak
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

      {flowers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <span className="text-3xl opacity-40">🌱</span>
          </div>
          <p className="text-xs text-white/30 text-center max-w-[200px] leading-relaxed">
            Hold the stone to plant your first flower. Each day you check in, a new one grows.
          </p>
        </div>
      ) : (
        <>
          <div className="relative bg-gradient-to-b from-transparent via-emerald-950/10 to-emerald-950/20 rounded-2xl border border-white/5 p-4 min-h-[280px]">
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-emerald-900/15 to-transparent rounded-b-2xl" />

            <div className="flex flex-wrap gap-1 justify-center items-end">
              {flowers.map((flower, i) => (
                <motion.div
                  key={flower.date}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <FlowerSVG
                    data={flower}
                    size={flowers.length > 14 ? 44 : flowers.length > 7 ? 52 : 64}
                    onClick={() => setSelectedDate(selectedDate === flower.date ? null : flower.date)}
                    isSelected={selectedDate === flower.date}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/70 font-medium">{selected.dayLabel}</p>
                    <p className="text-[10px] text-white/30">
                      {selected.count} check-in{selected.count > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <StatChip label="Showed up" value={selected.attendedClass} />
                    <StatChip label="Nourished" value={selected.ateWell} />
                    <StatChip label="Left room" value={selected.leftRoom ?? undefined} />
                    <StatChip label="Late night" value={selected.isLateNight} invert />
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-white/30">Masking</p>
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <div
                          key={v}
                          className={`h-1.5 flex-1 rounded-full ${
                            v <= selected.maskingLevel
                              ? "bg-violet-500/60"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] text-white/40">{selected.maskingLevel}/5</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

function StatChip({ label, value, invert }: { label: string; value?: boolean; invert?: boolean }) {
  if (value === undefined) return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/3 border border-white/5">
      <div className="w-2 h-2 rounded-full bg-white/15" />
      <span className="text-[10px] text-white/25">{label}</span>
    </div>
  );
  const good = invert ? !value : value;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
      good ? "bg-emerald-500/8 border-emerald-500/15" : "bg-white/3 border-white/5"
    }`}>
      <div className={`w-2 h-2 rounded-full ${good ? "bg-emerald-400/60" : "bg-white/20"}`} />
      <span className={`text-[10px] ${good ? "text-emerald-300/60" : "text-white/30"}`}>{label}</span>
    </div>
  );
}
