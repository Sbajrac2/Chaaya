import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, UtensilsCrossed, Utensils, Loader2 } from "lucide-react";
import { useCreateCheckin, useGenerateInsight, useGetCheckins } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface CheckinFlowProps {
  sessionId: string;
  lat?: number | null;
  lon?: number | null;
  holdDurationMs: number;
  interactionLatencyMs: number;
  onComplete: (bioNote?: string) => void;
}

const fadeVariants = {
  initial: { opacity: 0, scale: 0.92, filter: "blur(12px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.5 } },
  exit: { opacity: 0, scale: 1.05, filter: "blur(12px)", transition: { duration: 0.4 } },
};

export function CheckinFlow({
  sessionId,
  lat,
  lon,
  holdDurationMs,
  interactionLatencyMs,
  onComplete,
}: CheckinFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3 | "submitting" | "done">(1);
  const [attendedClass, setAttendedClass] = useState(true);
  const [ateWell, setAteWell] = useState(true);
  const [maskingLevel, setMaskingLevel] = useState(3);
  const [bioNote, setBioNote] = useState<string | null>(null);

  const qc = useQueryClient();
  const createCheckin = useCreateCheckin();
  const generateInsight = useGenerateInsight();
  const { data: checkins } = useGetCheckins({ sessionId, limit: 10 }, { query: { enabled: false } });

  const submit = async (finalMasking: number) => {
    setStep("submitting");
    try {
      await createCheckin.mutateAsync({
        data: {
          sessionId,
          attendedClass,
          ateWell,
          maskingLevel: finalMasking,
          holdDurationMs,
          interactionLatencyMs,
          lat: lat ?? null,
          lon: lon ?? null,
        },
      });

      // Invalidate queries so garden and checkins refresh
      qc.invalidateQueries({ queryKey: ["getGarden"] });
      qc.invalidateQueries({ queryKey: ["getCheckins"] });

      // Generate a short bio-validation note
      try {
        const insight = await generateInsight.mutateAsync({
          data: {
            sessionId,
            recentCheckins: checkins ?? [],
          },
        });
        setBioNote(insight.note);
      } catch {
        // Non-critical
      }

      setStep("done");
      setTimeout(() => onComplete(bioNote ?? undefined), 3500);
    } catch {
      onComplete();
    }
  };

  const pickClass = (val: boolean) => {
    setAttendedClass(val);
    setTimeout(() => setStep(2), 300);
  };

  const pickFood = (val: boolean) => {
    setAteWell(val);
    setTimeout(() => setStep(3), 300);
  };

  const confirmMasking = () => submit(maskingLevel);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-2xl">
      <AnimatePresence mode="wait">
        {/* Step 1: Attended class/work */}
        {step === 1 && (
          <motion.div key="step1" {...fadeVariants} className="flex flex-col items-center gap-16">
            {/* Icon: graduation cap / briefcase */}
            <div className="flex flex-col items-center gap-4 text-white/40">
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                <path d="M28 8L6 20l22 12 22-12L28 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="currentColor" fillOpacity="0.1"/>
                <path d="M6 20v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M17 26.5v8a11 11 0 0022 0v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-xs font-display tracking-[0.3em] uppercase text-white/30">Today</p>
            </div>

            <div className="flex gap-8">
              <ChoiceButton
                label={<X size={40} strokeWidth={1.5} />}
                accent="muted"
                onClick={() => pickClass(false)}
              />
              <ChoiceButton
                label={<Check size={40} strokeWidth={2} />}
                accent="primary"
                onClick={() => pickClass(true)}
              />
            </div>
          </motion.div>
        )}

        {/* Step 2: Ate well */}
        {step === 2 && (
          <motion.div key="step2" {...fadeVariants} className="flex flex-col items-center gap-16">
            <div className="flex flex-col items-center gap-4 text-white/40">
              <Utensils size={52} strokeWidth={1} />
              <p className="text-xs font-display tracking-[0.3em] uppercase text-white/30">Nourished</p>
            </div>

            <div className="flex gap-8">
              <ChoiceButton
                label={<UtensilsCrossed size={36} strokeWidth={1.5} />}
                accent="muted"
                onClick={() => pickFood(false)}
              />
              <ChoiceButton
                label={<Utensils size={36} strokeWidth={2} />}
                accent="accent"
                onClick={() => pickFood(true)}
              />
            </div>
          </motion.div>
        )}

        {/* Step 3: Masking level slider */}
        {step === 3 && (
          <motion.div key="step3" {...fadeVariants} className="flex flex-col items-center gap-12 w-full max-w-xs px-8">
            <div className="flex flex-col items-center gap-4 text-white/40">
              {/* Mask icon */}
              <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                <ellipse cx="26" cy="30" rx="18" ry="12" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.08"/>
                <circle cx="18" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="34" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M20 35 Q26 39 32 35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="text-xs font-display tracking-[0.3em] uppercase text-white/30">How real are you feeling?</p>
            </div>

            {/* Slider */}
            <div className="w-full space-y-6">
              <div className="relative">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-500/60 via-violet-500/60 to-fuchsia-700/60 mb-2" />
                <input
                  type="range"
                  min={1} max={5} step={1}
                  value={maskingLevel}
                  onChange={(e) => setMaskingLevel(+e.target.value)}
                  className="w-full absolute top-0 opacity-0 h-8 cursor-pointer"
                  style={{ margin: "-12px 0" }}
                />
                {/* Visual thumb indicator */}
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

            {/* Big dot indicators */}
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
              onClick={confirmMasking}
              className="mt-4 px-10 py-3.5 rounded-full bg-white/10 border border-white/20 text-white font-display text-sm tracking-widest uppercase hover:bg-white/20 active:scale-95 transition-all"
            >
              Done
            </button>
          </motion.div>
        )}

        {/* Submitting */}
        {step === "submitting" && (
          <motion.div key="submitting" {...fadeVariants} className="flex flex-col items-center gap-6">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
            <p className="text-xs font-display tracking-[0.3em] uppercase text-white/40">Recording...</p>
          </motion.div>
        )}

        {/* Done: bio-validation */}
        {step === "done" && (
          <motion.div key="done" {...fadeVariants} className="flex flex-col items-center gap-8 px-10 max-w-sm text-center">
            {/* Petal burst */}
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
              <p className="text-lg font-sans font-light text-white/90 leading-relaxed">
                {bioNote ?? "Petal recorded. One more bloom."}
              </p>
              <p className="text-xs font-display tracking-[0.25em] text-white/30 uppercase">+1 Petal</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChoiceButton({
  label,
  accent,
  onClick,
}: {
  label: React.ReactNode;
  accent: "primary" | "accent" | "muted";
  onClick: () => void;
}) {
  const colors = {
    primary: "border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/25 shadow-[0_0_30px_-5px_rgba(139,92,246,0.3)]",
    accent: "border-teal-500/40 bg-teal-500/10 text-teal-300 hover:bg-teal-500/25 shadow-[0_0_30px_-5px_rgba(20,184,166,0.3)]",
    muted: "border-white/15 bg-white/5 text-white/40 hover:bg-white/10",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "w-24 h-24 rounded-full border flex items-center justify-center transition-all duration-200",
        colors[accent]
      )}
    >
      {label}
    </motion.button>
  );
}
