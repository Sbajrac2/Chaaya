import { useGetCommunityPulse } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Users, Loader2 } from "lucide-react";

export function PulsePanel() {
  const { data: pulse, isLoading } = useGetCommunityPulse({ query: { staleTime: 1000 * 60 * 5 } });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent/50" />
        <p className="font-display tracking-widest text-sm uppercase">Feeling the pulse...</p>
      </div>
    );
  }

  const percentage = pulse?.percentageDarkStretch || 0;

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-8 pb-20">
      <div className="flex-1 flex flex-col items-center justify-center w-full relative w-full max-w-sm mx-auto">
        
        {/* Abstract Visualization */}
        <div className="relative w-48 h-48 mb-12 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
            <motion.circle 
              initial={{ strokeDashoffset: 289 }} // 2 * PI * 46
              animate={{ strokeDashoffset: 289 * (1 - (percentage / 100)) }}
              transition={{ duration: 2, ease: "easeOut" }}
              cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" 
              strokeLinecap="round" strokeDasharray="289"
              className="text-muted-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
            />
          </svg>
          
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="text-4xl font-display font-light text-white"
            >
              {Math.round(percentage)}%
            </motion.h2>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="flex justify-center text-muted-foreground/50 mb-2">
            <Users size={24} />
          </div>
          <p className="text-lg font-sans text-foreground leading-relaxed">
            {pulse?.message || "Many are navigating a dark stretch right now."}
          </p>
          <p className="text-sm font-display tracking-widest uppercase text-muted-foreground mt-8">
            You are not alone
          </p>
        </motion.div>
        
      </div>
    </div>
  );
}
