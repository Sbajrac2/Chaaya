import { useState } from "react";
import { motion } from "framer-motion";
import { UserProfile, TINT_OPTIONS } from "@/hooks/use-profile";

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState("");
  const [selectedHue, setSelectedHue] = useState(270);
  const [step, setStep] = useState<"name" | "tint">("name");

  const handleNameNext = () => {
    if (name.trim().length > 0) setStep("tint");
  };

  const handleFinish = () => {
    onComplete({ name: name.trim(), tintHue: selectedHue });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-[#080f0c] flex flex-col items-center justify-center px-8"
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${15 + (i * 11) % 70}%`,
              top: `${20 + (i * 13) % 60}%`,
              background: `hsla(${selectedHue}, 70%, 60%, 0.3)`,
            }}
            animate={{ y: [-8, 8, -8], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      {step === "name" && (
        <motion.div
          key="name"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-8 max-w-sm w-full"
        >
          <motion.div
            animate={{
              boxShadow: [
                `0 0 40px hsla(${selectedHue}, 70%, 50%, 0.3)`,
                `0 0 60px hsla(${selectedHue}, 70%, 50%, 0.5)`,
                `0 0 40px hsla(${selectedHue}, 70%, 50%, 0.3)`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 rounded-full"
            style={{ background: `linear-gradient(135deg, hsla(${selectedHue}, 70%, 50%, 0.8), hsla(${selectedHue + 30}, 60%, 40%, 0.6))` }}
          />

          <div className="text-center space-y-2">
            <h1 className="text-xl font-display font-light text-white/80 tracking-wider">
              Welcome to Aasha
            </h1>
            <p className="text-xs text-white/30 leading-relaxed max-w-[260px]">
              A behavioral awareness companion. Not a diagnosis — never a diagnosis.
            </p>
          </div>

          <div className="w-full space-y-4">
            <input
              type="text"
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleNameNext(); }}
              autoFocus
              className="w-full bg-white/5 border border-white/15 rounded-2xl px-6 py-4 text-base text-white/90 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors text-center font-display tracking-wide"
            />

            <button
              onClick={handleNameNext}
              disabled={name.trim().length === 0}
              className="w-full py-4 rounded-2xl border text-white font-display text-sm tracking-widest uppercase active:scale-95 transition-all disabled:opacity-20"
              style={{
                background: `hsla(${selectedHue}, 60%, 45%, 0.5)`,
                borderColor: `hsla(${selectedHue}, 60%, 50%, 0.3)`,
              }}
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}

      {step === "tint" && (
        <motion.div
          key="tint"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-8 max-w-sm w-full"
        >
          <div className="text-center space-y-2">
            <p className="text-lg font-display font-light text-white/80 tracking-wider">
              Hi, {name.trim()}
            </p>
            <p className="text-xs text-white/30">Choose your light</p>
          </div>

          <div className="grid grid-cols-3 gap-4 w-full">
            {TINT_OPTIONS.map((opt) => (
              <button
                key={opt.hue}
                onClick={() => setSelectedHue(opt.hue)}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-300 ${
                  selectedHue === opt.hue
                    ? "border-white/30 bg-white/10 scale-105"
                    : "border-white/8 bg-white/3 hover:bg-white/5"
                }`}
              >
                <motion.div
                  className="w-10 h-10 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, hsla(${opt.hue}, 70%, 55%, 0.9), hsla(${opt.hue + 20}, 60%, 40%, 0.7))`,
                    boxShadow: selectedHue === opt.hue
                      ? `0 0 20px hsla(${opt.hue}, 70%, 50%, 0.5)`
                      : "none",
                  }}
                  animate={selectedHue === opt.hue ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-[10px] font-display tracking-widest uppercase text-white/40">
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-2xl border text-white font-display text-sm tracking-widest uppercase active:scale-95 transition-all"
            style={{
              background: `hsla(${selectedHue}, 60%, 45%, 0.5)`,
              borderColor: `hsla(${selectedHue}, 60%, 50%, 0.3)`,
            }}
          >
            Enter
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
