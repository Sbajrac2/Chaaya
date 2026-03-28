import { useState, useEffect } from "react";
import { useGenerateInsight, useGenerateExtensionEmail, useGetCheckins } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, MapPin, Loader2, ArrowLeft, Brain, Eye, Moon, Activity } from "lucide-react";
import type { WeatherData } from "@workspace/api-client-react/src/generated/api.schemas";

interface NotePanelProps {
  sessionId: string;
  weather: WeatherData | undefined;
}

type View = "note" | "email-form" | "email-result" | "sanctuary";

const READING_SIGNALS = [
  { icon: Moon, label: "Sleep patterns" },
  { icon: Eye, label: "Masking trends" },
  { icon: Activity, label: "Energy signals" },
  { icon: Brain, label: "Behavioral shifts" },
];

export function NotePanel({ sessionId, weather }: NotePanelProps) {
  const [view, setView] = useState<View>("note");
  const [profName, setProfName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [assignName, setAssignName] = useState("");
  const [hasTriggered, setHasTriggered] = useState(false);

  const { data: checkins } = useGetCheckins(
    { sessionId, limit: 14 },
    { query: { enabled: !!sessionId, refetchOnMount: true } }
  );

  const insight = useGenerateInsight();
  const email = useGenerateExtensionEmail();

  useEffect(() => {
    if (checkins !== undefined && !hasTriggered && !insight.data && !insight.isPending) {
      setHasTriggered(true);
      insight.mutate({
        data: {
          sessionId,
          recentCheckins: checkins,
          weatherData: weather || {
            temperature: 20,
            description: "Unable to load weather",
            uvIndex: 3,
            sunlightHours: 6,
            barometricPressure: 1013,
            isLowSunlight: false,
            city: "Your location",
          },
          academicWeek: getAcademicWeek(),
        },
      });
    }
  }, [checkins, hasTriggered, sessionId, weather, insight]);

  const handleEmailGenerate = async () => {
    try {
      const res = await email.mutateAsync({
        data: { professorName: profName, courseName, assignmentName: assignName },
      });
      if (res.mailtoLink) {
        window.open(res.mailtoLink, "_blank");
      }
      setView("email-result");
    } catch {}
  };

  return (
    <div className="flex flex-col h-full px-7 pt-4 pb-16 overflow-y-auto">
      <AnimatePresence mode="wait">
        {view === "note" && (
          <motion.div
            key="note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col flex-1"
          >
            {insight.isPending || (!insight.data && !insight.error) ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-8 text-white/30">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles size={28} className="text-violet-400/60" />
                </motion.div>
                <div className="space-y-3">
                  {READING_SIGNALS.map((signal, i) => (
                    <motion.div
                      key={signal.label}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 0.6, x: 0 }}
                      transition={{ delay: i * 0.4 + 0.5, duration: 0.4 }}
                      className="flex items-center gap-3"
                    >
                      <signal.icon size={14} className="text-violet-400/40" />
                      <p className="text-[11px] font-display tracking-widest text-white/25">{signal.label}</p>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: 40 + Math.random() * 30 }}
                        transition={{ delay: i * 0.4 + 0.8, duration: 0.6 }}
                        className="h-1 rounded-full bg-violet-500/20"
                      />
                    </motion.div>
                  ))}
                </div>
                <p className="text-[10px] font-display tracking-[0.3em] uppercase text-center text-white/20 mt-2">
                  Reading your patterns...
                </p>
              </div>
            ) : insight.error ? (
              <div className="flex flex-col items-center gap-4 text-white/30 pt-6">
                <p className="text-base text-white/50">Couldn't read the patterns.</p>
                <button
                  onClick={() => { setHasTriggered(false); }}
                  className="text-xs text-violet-400 underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6 pt-2">
                <Sparkles size={20} className="text-violet-400/50" />

                <p className="text-lg font-sans font-light text-white/90 leading-relaxed">
                  "{insight.data?.note || "The stone feels heavy. You showed up anyway."}"
                </p>

                {insight.data?.patterns && insight.data.patterns.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-display tracking-[0.35em] uppercase text-white/20">
                      What Asha noticed
                    </p>
                    {insight.data.patterns.map((p: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/4 border border-white/8"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400/50 mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-white/50 leading-relaxed">{p}</p>
                      </motion.div>
                    ))}
                  </div>
                )}

                <div className="space-y-3 pt-3">
                  <p className="text-[9px] font-display tracking-[0.35em] uppercase text-white/25 mb-3">
                    Lighten the Load
                  </p>
                  <ActionCard
                    icon={<Mail size={18} />}
                    label="Draft extension email"
                    sublabel="Asha writes it for you"
                    color="violet"
                    onClick={() => setView("email-form")}
                  />
                  <ActionCard
                    icon={<MapPin size={18} />}
                    label="Find sanctuary"
                    sublabel="Quiet spots near you"
                    color="teal"
                    onClick={() => setView("sanctuary")}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {view === "email-form" && (
          <motion.div
            key="email-form"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col gap-5 pt-2"
          >
            <button onClick={() => setView("note")} className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors mb-2">
              <ArrowLeft size={16} /> <span className="text-xs font-display tracking-widest uppercase">Back</span>
            </button>

            <p className="text-sm text-white/60 leading-relaxed">
              Need more time on an assignment? Asha will draft a warm, professional email to your professor.
            </p>

            <div className="space-y-3">
              {[
                { placeholder: "Professor name (optional)", val: profName, set: setProfName },
                { placeholder: "Course name (optional)", val: courseName, set: setCourseName },
                { placeholder: "Assignment name (optional)", val: assignName, set: setAssignName },
              ].map(({ placeholder, val, set }) => (
                <input
                  key={placeholder}
                  type="text"
                  placeholder={placeholder}
                  value={val}
                  onChange={(e) => set(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white/80 placeholder-white/25 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              ))}
            </div>

            <button
              onClick={handleEmailGenerate}
              disabled={email.isPending}
              className="w-full py-4 rounded-2xl bg-violet-600/80 border border-violet-500/30 text-white font-display text-sm tracking-widest uppercase hover:bg-violet-600 active:scale-95 transition-all flex justify-center items-center gap-2"
            >
              {email.isPending ? <Loader2 size={16} className="animate-spin" /> : "Generate & Open Mail"}
            </button>

            <p className="text-[10px] text-white/20 text-center leading-relaxed">
              Opens your mail app with the email ready to send.
            </p>
          </motion.div>
        )}

        {view === "email-result" && (
          <motion.div
            key="email-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6 pt-10 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Mail size={28} className="text-violet-400" />
            </div>
            <div className="space-y-2">
              <p className="text-base text-white/80 font-light">Email opened in your mail app.</p>
              <p className="text-xs text-white/30 max-w-[220px] leading-relaxed">
                Your professor deserves to know you're trying. That took courage.
              </p>
            </div>
            {email.data && (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
                <p className="text-[10px] font-display tracking-widest uppercase text-white/30">Subject</p>
                <p className="text-sm text-white/70">{email.data.subject}</p>
                <p className="text-[10px] font-display tracking-widest uppercase text-white/30 mt-3">Body</p>
                <p className="text-xs text-white/50 whitespace-pre-wrap leading-relaxed">{email.data.body}</p>
              </div>
            )}
            <button onClick={() => setView("note")} className="text-xs text-white/30 underline mt-2">
              Back
            </button>
          </motion.div>
        )}

        {view === "sanctuary" && (
          <motion.div
            key="sanctuary"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col gap-6 pt-2"
          >
            <button onClick={() => setView("note")} className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors mb-2">
              <ArrowLeft size={16} /> <span className="text-xs font-display tracking-widest uppercase">Back</span>
            </button>

            <div className="flex items-start gap-4 p-5 rounded-2xl bg-teal-900/20 border border-teal-500/20">
              <MapPin size={20} className="text-teal-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/70 leading-relaxed">
                {insight.data?.sanctuarySuggestion ??
                  "Find somewhere quiet and low-stimulation — near a window if you can. 10 minutes of stillness is recovery."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { label: "Library quiet floor", note: "Low light, high quiet" },
                { label: "Outside bench", note: "Natural light reset" },
                { label: "Empty classroom", note: "Alone with your thoughts" },
                { label: "Café corner", note: "Low-pressure ambient noise" },
              ].map(({ label, note }) => (
                <div key={label} className="p-4 rounded-2xl bg-white/4 border border-white/8">
                  <p className="text-xs text-white/70 font-medium">{label}</p>
                  <p className="text-[10px] text-white/30 mt-1">{note}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionCard({
  icon, label, sublabel, color, onClick,
}: {
  icon: React.ReactNode; label: string; sublabel: string;
  color: "violet" | "teal"; onClick: () => void;
}) {
  const colorMap = {
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    teal: "bg-teal-500/10 border-teal-500/20 text-teal-400",
  };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all hover:brightness-125 active:scale-97 ${colorMap[color]}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="text-left">
        <span className="text-sm font-display tracking-wide text-white/70 block">{label}</span>
        <span className="text-[10px] text-white/25">{sublabel}</span>
      </div>
    </button>
  );
}

function getAcademicWeek(): number {
  const now = new Date();
  const month = now.getMonth() + 1;
  if (month >= 1 && month <= 5) {
    const start = new Date(now.getFullYear(), 0, 13);
    return Math.ceil((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  } else if (month >= 8 && month <= 12) {
    const start = new Date(now.getFullYear(), 7, 26);
    return Math.ceil((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
  }
  return 7;
}
