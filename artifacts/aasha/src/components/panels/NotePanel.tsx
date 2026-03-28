import { useState, useEffect } from "react";
import { useGenerateInsight, useGenerateExtensionEmail, useGetCheckins } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mail, Heart, Loader2 } from "lucide-react";
import type { WeatherData } from "@workspace/api-client-react/src/generated/api.schemas";

interface NotePanelProps {
  sessionId: string;
  weather: WeatherData | undefined;
}

export function NotePanel({ sessionId, weather }: NotePanelProps) {
  const [hasGenerated, setHasGenerated] = useState(false);
  const [showExtensionForm, setShowExtensionForm] = useState(false);
  const [showSanctuary, setShowSanctuary] = useState(false);

  // Form State
  const [profName, setProfName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [assignName, setAssignName] = useState("");

  const { data: checkins } = useGetCheckins({ sessionId, limit: 10 }, { query: { enabled: !!sessionId }});
  
  const generateInsight = useGenerateInsight();
  const generateEmail = useGenerateExtensionEmail();

  useEffect(() => {
    if (checkins && !hasGenerated && !generateInsight.isPending && !generateInsight.data) {
      setHasGenerated(true);
      generateInsight.mutate({
        data: {
          sessionId,
          recentCheckins: checkins,
          weatherData: weather,
        }
      });
    }
  }, [checkins, hasGenerated, sessionId, weather, generateInsight]);

  const handleEmailGenerate = async () => {
    try {
      const res = await generateEmail.mutateAsync({
        data: {
          professorName: profName,
          courseName,
          assignmentName: assignName
        }
      });
      if (res.mailtoLink) {
        window.open(res.mailtoLink, "_blank");
      }
      setShowExtensionForm(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full w-full px-8 pt-12 pb-24 overflow-y-auto custom-scrollbar">
      {generateInsight.isPending || !generateInsight.data ? (
        <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground gap-6">
          <Sparkles className="w-8 h-8 animate-pulse text-accent" />
          <p className="font-display tracking-widest text-sm uppercase text-center leading-loose">
            Asha is reflecting<br/>on your patterns...
          </p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col flex-1"
        >
          <div className="mb-10 text-accent/70">
            <Sparkles className="w-6 h-6" />
          </div>
          
          <p className="text-xl md:text-2xl text-foreground font-sans font-light leading-relaxed mb-12 text-pretty">
            "{generateInsight.data.note}"
          </p>

          <AnimatePresence mode="wait">
            {!showExtensionForm && !showSanctuary && generateInsight.data.showLightenLoad && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                className="mt-auto space-y-4"
              >
                <p className="text-xs font-display tracking-widest text-muted-foreground uppercase mb-4">Lighten the Load</p>
                <button 
                  onClick={() => setShowExtensionForm(true)}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left flex items-center gap-4 hover:bg-white/10 transition-colors"
                >
                  <div className="p-2 rounded-full bg-primary/20 text-primary"><Mail size={18} /></div>
                  <span className="font-display text-sm tracking-wide">Draft an extension email</span>
                </button>
                <button 
                  onClick={() => setShowSanctuary(true)}
                  className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-left flex items-center gap-4 hover:bg-white/10 transition-colors"
                >
                  <div className="p-2 rounded-full bg-accent/20 text-accent"><Heart size={18} /></div>
                  <span className="font-display text-sm tracking-wide">Find Sanctuary</span>
                </button>
              </motion.div>
            )}

            {showExtensionForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-auto space-y-4 bg-black/40 p-6 rounded-3xl border border-white/5"
              >
                <h3 className="font-display text-sm tracking-widest text-white uppercase mb-4">Extension Request</h3>
                <input 
                  type="text" placeholder="Professor Name" value={profName} onChange={e => setProfName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <input 
                  type="text" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <input 
                  type="text" placeholder="Assignment" value={assignName} onChange={e => setAssignName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setShowExtensionForm(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-display hover:bg-white/5 transition-colors">Cancel</button>
                  <button 
                    onClick={handleEmailGenerate} disabled={generateEmail.isPending}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-display hover:bg-primary/90 transition-colors flex justify-center items-center"
                  >
                    {generateEmail.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
                  </button>
                </div>
              </motion.div>
            )}

            {showSanctuary && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="mt-auto bg-accent/10 border border-accent/20 p-6 rounded-3xl"
              >
                <div className="mb-4 text-accent"><Heart size={24} /></div>
                <p className="text-sm leading-relaxed text-foreground mb-6">
                  {generateInsight.data.sanctuarySuggestion || "Take 15 minutes right now. Close your laptop. Find a quiet spot, ideally near a window or outside. Do nothing. Just breathe."}
                </p>
                <button onClick={() => setShowSanctuary(false)} className="text-xs font-display tracking-widest text-muted-foreground uppercase hover:text-white transition-colors">
                  Return
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
