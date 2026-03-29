import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogOut, Check } from "lucide-react";
import { UserProfile, TINT_OPTIONS } from "@/hooks/use-profile";

interface ProfilePanelProps {
  profile: UserProfile;
  open: boolean;
  onClose: () => void;
  onSave: (p: UserProfile) => void;
  onSignOut: () => void;
}

export function ProfilePanel({ profile, open, onClose, onSave, onSignOut }: ProfilePanelProps) {
  const [name, setName] = useState(profile.name);
  const [university, setUniversity] = useState(profile.university || "");
const [city, setCity] = useState(profile.city || "");
  const [state, setState] = useState(profile.state || "");
  const [selectedHue, setSelectedHue] = useState(profile.tintHue);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      tintHue: selectedHue,
      university: university.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
    });
    onClose();
  };

  const handleSignOut = () => {
    if (!confirmSignOut) {
      setConfirmSignOut(true);
      return;
    }
    onSignOut();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-[min(340px,85vw)] bg-[#0a1210] border-l border-white/8 overflow-y-auto"
          >
            <div className="flex flex-col h-full p-6 space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/30">Profile</p>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors text-white/40 hover:text-white/70">
                  <X size={18} />
                </button>
              </div>

              <div className="flex flex-col items-center gap-3 py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-light text-white/80 border border-white/15"
                  style={{
                    background: `radial-gradient(circle, hsla(${selectedHue}, 60%, 40%, 0.4), hsla(${selectedHue}, 50%, 20%, 0.15))`,
                    boxShadow: `0 0 30px hsla(${selectedHue}, 60%, 50%, 0.2)`,
                  }}
                >
                  {name.trim().charAt(0).toUpperCase() || "?"}
                </div>
                <p className="text-sm text-white/50 font-light">{name.trim() || "Your name"}</p>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/25">Edit info</p>

                <div className="space-y-1">
                  <label className="text-[9px] font-display tracking-widest uppercase text-white/20">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="Your first name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display tracking-widest uppercase text-white/20">University</label>
                  <input
                    type="text"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="e.g. UC Berkeley"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display tracking-widest uppercase text-white/20">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="e.g. San Francisco"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-display tracking-widest uppercase text-white/20">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-colors"
                    placeholder="e.g. CA"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/25">Your light</p>
                <div className="grid grid-cols-3 gap-2">
                  {TINT_OPTIONS.map(opt => {
                    const isSelected = opt.hue === selectedHue;
                    return (
                      <button
                        key={opt.hue}
                        onClick={() => setSelectedHue(opt.hue)}
                        className={`relative flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all ${
                          isSelected
                            ? "border-white/20 bg-white/8"
                            : "border-white/6 bg-white/3 hover:bg-white/5"
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{
                            background: `hsla(${opt.hue}, 70%, 55%, 0.8)`,
                            boxShadow: isSelected ? `0 0 12px hsla(${opt.hue}, 70%, 55%, 0.5)` : "none",
                          }}
                        />
                        <span className="text-[10px] text-white/50 font-display tracking-wider">{opt.label}</span>
                        {isSelected && (
                          <Check size={10} className="absolute top-1.5 right-1.5 text-white/40" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1" />

              <div className="space-y-3 pb-4">
                <button
                  onClick={handleSave}
                  disabled={!name.trim()}
                  className="w-full py-3.5 rounded-2xl font-display tracking-widest uppercase text-xs transition-all disabled:opacity-30"
                  style={{
                    background: `linear-gradient(135deg, hsla(${selectedHue}, 50%, 35%, 0.5), hsla(${selectedHue}, 40%, 25%, 0.3))`,
                    border: `1px solid hsla(${selectedHue}, 50%, 50%, 0.2)`,
                    color: `hsla(${selectedHue}, 70%, 80%, 0.8)`,
                    boxShadow: `0 0 20px hsla(${selectedHue}, 50%, 50%, 0.1)`,
                  }}
                >
                  Save changes
                </button>

                <button
                  onClick={handleSignOut}
                  className={`w-full py-3 rounded-2xl font-display tracking-widest uppercase text-[10px] transition-all border ${
                    confirmSignOut
                      ? "bg-red-500/10 border-red-500/20 text-red-300/70"
                      : "bg-white/3 border-white/6 text-white/30 hover:text-white/50"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <LogOut size={12} />
                    {confirmSignOut ? "Tap again to confirm sign out" : "Sign out"}
                  </span>
                </button>
                {confirmSignOut && (
                  <p className="text-[9px] text-red-400/40 text-center leading-relaxed">
                    This will clear all your local data and return to the welcome screen.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ProfileButtonProps {
  profile: UserProfile;
  onClick: () => void;
}

export function ProfileButton({ profile, onClick }: ProfileButtonProps) {
  const initial = profile.name.charAt(0).toUpperCase();
  const hue = profile.tintHue ?? 270;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/4 border border-white/8 hover:bg-white/6 transition-all group"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-light text-white/80 border border-white/15 transition-shadow group-hover:shadow-lg"
        style={{
          background: `radial-gradient(circle, hsla(${hue}, 60%, 40%, 0.5), hsla(${hue}, 50%, 20%, 0.2))`,
          boxShadow: `0 0 16px hsla(${hue}, 60%, 50%, 0.2)`,
        }}
      >
        {initial}
      </div>
      <span className="text-[10px] font-display tracking-widest uppercase text-white/35 group-hover:text-white/55 transition-colors hidden min-[360px]:inline">
        {profile.name}
      </span>
    </button>
  );
}
