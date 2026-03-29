import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Utensils, UtensilsCrossed, Loader2,
  DoorOpen, DoorClosed, Sun, BrainCog, HandHeart, SkipForward
} from "lucide-react";
import { useCreateCheckin, useGenerateBioValidation } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useWeatherSync } from "@/hooks/use-weather-sync";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CheckinFlowProps {
  sessionId: string;
  lat?: number | null;
  lon?: number | null;
  holdDurationMs: number;
  interactionLatencyMs: number;
  onComplete: (bioNote?: string) => void;
}

type Step = 1 | 2 | 3 | 4 | "submitting" | "bio" | "done";

const TOTAL_STEPS = 4;

const fadeVariants = {
  initial: { opacity: 0, scale: 0.92, filter: "blur(12px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.4 } },
  exit: { opacity: 0, scale: 1.05, filter: "blur(12px)", transition: { duration: 0.3 } },
};

export function CheckinFlow({
  sessionId,
  lat,
  lon,
  holdDurationMs,
  interactionLatencyMs,
  onComplete,
}: CheckinFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [attendedClass, setAttendedClass] = useState(true);
  const [ateWell, setAteWell] = useState(true);
  const [leftRoom, setLeftRoom] = useState<boolean | null>(null);
  const [maskingLevel, setMaskingLevel] = useState(3);
  const [bioCard, setBioCard] = useState<{ card: string; xpGained: number; factType: string } | null>(null);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  const qc = useQueryClient();
  const createCheckin = useCreateCheckin();
  const bioValidation = useGenerateBioValidation();
  const { weather } = useWeatherSync();
  const { toast } = useToast();

  const advance = useCallback((nextStep: Step) => {
    setHoveredOption(null);
    setTimeout(() => setStep(nextStep), 280);
  }, []);

  const submit = async (finalMasking: number) => {
    setStep("submitting");
    try {
      const hour = new Date().getHours();
      const result = await createCheckin.mutateAsync({
        data: {
          sessionId,
          attendedClass,
          ateWell,
          maskingLevel: finalMasking,
          holdDurationMs,
          interactionLatencyMs,
          lat: lat ?? null,
          lon: lon ?? null,
          leftRoom,
          hadSunlightExposure: hour >= 7 && hour <= 18 ? true : null,
        },
      });

      qc.invalidateQueries({ queryKey: ["getGarden"] });
      qc.invalidateQueries({ queryKey: ["getCheckins"] });

      try {
        const bio = await bioValidation.mutateAsync({
          data: {
            sessionId,
            checkin: result,
            weatherData: weather || {
              temperature: 20,
              description: "Unable to load weather",
              uvIndex: 3,
              sunlightHours: 6,
              barometricPressure: 1013,
              isLowSunlight: false,
              city: "Your location",
            },
          },
        });
        setBioCard(bio);
        setStep("bio");
      } catch (e) {
        console.warn("[CheckinFlow] bio validation failed, skipping", e)
        setStep("done");
        setTimeout(() => onComplete(), 2500);
      }
    } catch (e) {
      console.error("[CheckinFlow] Failed to save checkin:", e);
      toast({
        title: "Failed to save your check-in",
        description: "Please try again later.",
        variant: "destructive"
      });
      onComplete();
    }
  };

  const skipAll = () => {
    submit(maskingLevel);
  };

  const currentStepNum = typeof step === "number" ? step : TOTAL_STEPS;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-2xl">
      {typeof step === "number" && (
        <>
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i < currentStepNum ? "bg-violet-500/70 w-8" : "bg-white/10 w-4"
                )}
                layout
              />
            ))}
          </div>

          <button
            onClick={skipAll}
            className="absolute top-8 right-6 flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors"
          >
            <span className="text-[10px] font-display tracking-widest uppercase">Skip</span>
            <SkipForward size={14} />
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <BinaryStep
            key="class"
            icon={
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <path d="M26 8L6 20l20 11 20-11L26 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
                <path d="M6 20v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 26v7a10 10 0 0020 0v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            label="Showed up today?"
            yesIcon={<Check size={36} strokeWidth={2} />}
            noIcon={<X size={36} strokeWidth={1.5} />}
            yesTooltip="I made it to class or showed up for my commitments"
            noTooltip="Couldn't make it today — maybe academic overwhelm, anxiety about falling behind, transportation issues, or just needing space. Whatever the reason is valid."
            onYes={() => { setAttendedClass(true); advance(2); }}
            onNo={() => { setAttendedClass(false); advance(2); }}
            onSkip={() => advance(2)}
            hoveredOption={hoveredOption}
            setHoveredOption={setHoveredOption}
          />
        )}

        {step === 2 && (
          <BinaryStep
            key="food"
            icon={<Utensils size={48} strokeWidth={1} />}
            label="Nourished?"
            yesIcon={<Utensils size={32} strokeWidth={2} />}
            noIcon={<UtensilsCrossed size={32} strokeWidth={1.5} />}
            yesTooltip="I ate something today that felt like taking care of myself"
            noTooltip="Didn't eat well — could be food insecurity, disordered eating patterns, no time between commitments, budget constraints, or simply forgetting. Your body still deserves fuel."
            onYes={() => { setAteWell(true); advance(3); }}
            onNo={() => { setAteWell(false); advance(3); }}
            onSkip={() => advance(3)}
            hoveredOption={hoveredOption}
            setHoveredOption={setHoveredOption}
          />
        )}

        {step === 3 && (
          <BinaryStep
            key="room"
            icon={<DoorOpen size={48} strokeWidth={1} />}
            label="Left your room?"
            yesIcon={<DoorOpen size={32} strokeWidth={2} />}
            noIcon={<DoorClosed size={32} strokeWidth={1.5} />}
            yesTooltip="I stepped outside my space today — even briefly"
            noTooltip="Stayed in all day — could be social withdrawal, low energy, depressive patterns, sensory overwhelm, or a protective cocoon. Isolation is sometimes safety, sometimes a signal."
            onYes={() => { setLeftRoom(true); advance(4); }}
            onNo={() => { setLeftRoom(false); advance(4); }}
            onSkip={() => advance(4)}
            hoveredOption={hoveredOption}
            setHoveredOption={setHoveredOption}
          />
        )}

        {step === 4 && (
          <motion.div key="masking" {...fadeVariants} className="flex flex-col items-center gap-10 w-full max-w-xs px-8">
            <div className="flex flex-col items-center gap-3 text-white/40">
              <svg width="48" height="48" viewBox="0 0 52 52" fill="none">
                <ellipse cx="26" cy="30" rx="18" ry="12" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08"/>
                <circle cx="18" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="34" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M20 35 Q26 39 32 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-xs font-display tracking-[0.3em] uppercase text-white/30">Were you the real you today?</p>
              <p className="text-[10px] text-white/20 max-w-[240px] text-center leading-relaxed">
                The gap between who you are inside and who you showed the world. Masking costs energy — we're measuring that cost.
              </p>
            </div>

            <div className="w-full space-y-5">
              <div className="relative">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500/60 via-violet-500/60 to-fuchsia-700/60 mb-2" />
                <input
                  type="range" min={1} max={5} step={1} value={maskingLevel}
                  onChange={(e) => setMaskingLevel(+e.target.value)}
                  className="w-full absolute top-0 opacity-0 h-8 cursor-pointer"
                  style={{ margin: "-12px 0" }}
                />
                <div
                  className="w-7 h-7 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.4)] absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-all duration-150"
                  style={{ left: `${((maskingLevel - 1) / 4) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-display tracking-widest text-white/30 uppercase">
                <span>Fully you</span>
                <span>Heavily masked</span>
              </div>
            </div>

            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setMaskingLevel(v)}
                  className={cn(
                    "w-8 h-8 rounded-full border transition-all duration-200",
                    maskingLevel === v
                      ? "bg-white/80 border-white/80 scale-110"
                      : "bg-white/10 border-white/20 hover:bg-white/20"
                  )}
                />
              ))}
            </div>

            <button
              onClick={() => submit(maskingLevel)}
              className="mt-2 px-10 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-display text-sm tracking-widest uppercase hover:bg-white/20 active:scale-95 transition-all"
            >
              Done
            </button>
          </motion.div>
        )}

        {step === "submitting" && (
          <motion.div key="submitting" {...fadeVariants} className="flex flex-col items-center gap-6">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs font-display tracking-[0.3em] uppercase text-white/40">Recording...</p>
          </motion.div>
        )}

        {step === "bio" && bioCard && (
          <motion.div
            key="bio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8 px-8 max-w-sm text-center"
          >
            <FactTypeIcon factType={bioCard.factType} />
            <div className="space-y-4">
              <p className="text-base font-sans font-light text-white/85 leading-relaxed">
                {bioCard.card}
              </p>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/15 border border-violet-500/20"
              >
                <span className="text-xs font-display tracking-widest text-violet-300 uppercase">
                  +{bioCard.xpGained} Wisdom XP
                </span>
              </motion.div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => onComplete()}
                className="px-8 py-3 rounded-full bg-white/8 border border-white/15 text-white/60 font-display text-xs tracking-widest uppercase hover:bg-white/15 active:scale-95 transition-all"
              >
                Continue
              </button>
              <button
                onClick={() => onComplete()}
                className="flex items-center gap-1.5 text-white/25 hover:text-white/50 transition-colors"
              >
                <span className="text-[10px] font-display tracking-widest uppercase">Skip</span>
                <SkipForward size={12} />
              </button>
            </div>
          </motion.div>
        )}

        {step === "done" && (
          <motion.div key="done" {...fadeVariants} className="flex flex-col items-center gap-8 px-10 max-w-sm text-center">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-5 rounded-full bg-gradient-to-b from-accent to-primary"
                  style={{ transformOrigin: "bottom center", rotate: `${i * 45}deg`, bottom: "50%" }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 0.7 }}
                  transition={{ delay: i * 0.07, duration: 0.5, ease: "backOut" }}
                />
              ))}
              <div className="w-5 h-5 rounded-full bg-accent z-10 shadow-[0_0_20px_hsl(var(--accent))]" />
            </div>
            <div className="space-y-3">
              <p className="text-lg font-sans font-light text-white/90">Petal recorded.</p>
              <p className="text-xs font-display tracking-[0.25em] text-white/30 uppercase">+1 Petal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BinaryStep({
  icon, label, yesIcon, noIcon, yesTooltip, noTooltip, onYes, onNo, onSkip, hoveredOption, setHoveredOption,
}: {
  icon: React.ReactNode; label: string;
  yesIcon: React.ReactNode; noIcon: React.ReactNode;
  yesTooltip: string; noTooltip: string;
  onYes: () => void; onNo: () => void; onSkip: () => void;
  hoveredOption: string | null; setHoveredOption: (v: string | null) => void;
}) {
  return (
    <motion.div {...fadeVariants} className="flex flex-col items-center gap-10">
      <div className="flex flex-col items-center gap-3 text-white/40">
        {icon}
        <p className="text-xs font-display tracking-[0.3em] uppercase text-white/30">{label}</p>
      </div>

      <div className="flex gap-8">
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onYes}
            onMouseEnter={() => setHoveredOption("yes")}
            onMouseLeave={() => setHoveredOption(null)}
            className="rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/25 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)] flex items-center justify-center transition-all duration-200"
            style={{ width: 88, height: 88 }}
          >
            {yesIcon}
          </motion.button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNo}
            onMouseEnter={() => setHoveredOption("no")}
            onMouseLeave={() => setHoveredOption(null)}
            className="rounded-full border border-white/15 bg-white/5 text-white/40 hover:bg-white/10 flex items-center justify-center transition-all duration-200"
            style={{ width: 88, height: 88 }}
          >
            {noIcon}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {hoveredOption && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] text-white/35 max-w-[280px] text-center leading-relaxed px-4"
          >
            {hoveredOption === "yes" ? yesTooltip : noTooltip}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        onClick={onSkip}
        className="flex items-center gap-1.5 text-white/20 hover:text-white/40 transition-colors mt-2"
      >
        <span className="text-[10px] font-display tracking-widest uppercase">Skip this</span>
        <SkipForward size={12} />
      </button>
    </motion.div>
  );
}

function FactTypeIcon({ factType }: { factType: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    weather: <Sun size={32} className="text-amber-400" />,
    circadian: <BrainCog size={32} className="text-indigo-400" />,
    isolation: <HandHeart size={32} className="text-teal-400" />,
    nutrition: <Utensils size={32} className="text-emerald-400" />,
    cognitive: <BrainCog size={32} className="text-violet-400" />,
    general: <Check size={32} className="text-white/50" />,
  };
  return (
    <motion.div
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: "spring", damping: 12 }}
      className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
    >
      {iconMap[factType] || iconMap.general}
    </motion.div>
  );
}
