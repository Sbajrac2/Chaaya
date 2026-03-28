import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Utensils, Coffee } from "lucide-react";
import { useCreateCheckin } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface CheckinFlowProps {
  sessionId: string;
  lat?: number | null;
  lon?: number | null;
  holdDurationMs: number;
  interactionLatencyMs: number;
  onComplete: () => void;
}

type QuestionStep = 1 | 2 | 3 | 4;

export function CheckinFlow({ 
  sessionId, 
  lat, 
  lon, 
  holdDurationMs, 
  interactionLatencyMs, 
  onComplete 
}: CheckinFlowProps) {
  const [step, setStep] = useState<QuestionStep>(1);
  const [attendedClass, setAttendedClass] = useState<boolean>(false);
  const [ateWell, setAteWell] = useState<boolean>(false);
  const [maskingLevel, setMaskingLevel] = useState<number>(3);
  
  const createCheckin = useCreateCheckin();

  const handleNext = async () => {
    if (step === 3) {
      setStep(4);
      // Submit
      try {
        await createCheckin.mutateAsync({
          data: {
            sessionId,
            attendedClass,
            ateWell,
            maskingLevel,
            holdDurationMs,
            interactionLatencyMs,
            lat,
            lon
          }
        });
        setTimeout(() => {
          onComplete();
        }, 2000);
      } catch (err) {
        console.error("Failed to check in", err);
        onComplete();
      }
    } else {
      setStep((s) => (s + 1) as QuestionStep);
    }
  };

  const variants = {
    initial: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
    animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: { opacity: 0, scale: 1.1, filter: "blur(10px)" }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-xl z-50">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" {...variants} transition={{ duration: 0.6 }} className="flex flex-col items-center gap-12">
            <h2 className="text-xl text-muted-foreground font-display tracking-widest uppercase">Class / Work</h2>
            <div className="flex gap-8">
              <button 
                onClick={() => { setAttendedClass(false); handleNext(); }}
                className="w-24 h-24 rounded-full bg-muted/30 border border-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-white transition-all active:scale-95"
              >
                <X size={40} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => { setAttendedClass(true); handleNext(); }}
                className="w-24 h-24 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/20 hover:text-white transition-all active:scale-95 shadow-[0_0_30px_-5px_hsl(var(--accent)/0.3)]"
              >
                <Check size={40} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" {...variants} transition={{ duration: 0.6 }} className="flex flex-col items-center gap-12">
            <h2 className="text-xl text-muted-foreground font-display tracking-widest uppercase">Nourishment</h2>
            <div className="flex gap-8">
              <button 
                onClick={() => { setAteWell(false); handleNext(); }}
                className="w-24 h-24 rounded-full bg-muted/30 border border-muted/50 flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-white transition-all active:scale-95"
              >
                <Coffee size={36} strokeWidth={1.5} />
              </button>
              <button 
                onClick={() => { setAteWell(true); handleNext(); }}
                className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary hover:bg-primary/20 hover:text-white transition-all active:scale-95 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]"
              >
                <Utensils size={36} strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" {...variants} transition={{ duration: 0.6 }} className="flex flex-col items-center gap-16 w-full max-w-md px-8">
            <h2 className="text-xl text-muted-foreground font-display tracking-widest uppercase text-center">Masking Level</h2>
            
            <div className="w-full relative py-8">
              <input 
                type="range" 
                min="1" 
                max="5" 
                step="1"
                value={maskingLevel}
                onChange={(e) => setMaskingLevel(parseInt(e.target.value))}
                className="w-full appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-accent [&::-webkit-slider-runnable-track]:to-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:-mt-3 [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              />
              <div className="flex justify-between w-full mt-6 text-sm font-display text-muted-foreground">
                <span>Authentic</span>
                <span>Heavy</span>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="px-8 py-3 rounded-full bg-white text-background font-display font-medium tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              COMPLETE
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" {...variants} transition={{ duration: 1 }} className="flex flex-col items-center gap-6">
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.2, 1] }} 
              transition={{ duration: 2, ease: "easeInOut" }}
              className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent opacity-50 blur-xl absolute"
            />
            <h2 className="text-2xl font-display text-white tracking-widest z-10">Recorded.</h2>
            <p className="text-muted-foreground font-display z-10 text-center max-w-xs leading-relaxed">
              Every day is different.<br/>Thank you for being honest.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
