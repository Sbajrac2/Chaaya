import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Heart, ExternalLink, Shield, ChevronDown, ChevronUp } from "lucide-react";

const REFERENCES = [
  {
    id: "lund2010",
    text: "Lund, H.G., Reider, B.D., Whiting, A.B., & Prichard, J.R. (2010). Sleep patterns and predictors of disturbed sleep in a large population of college students. Journal of Adolescent Health, 46(2), 124-132.",
  },
  {
    id: "crede2010",
    text: "Credé, M., Roch, S.G., & Kieszczynka, U.M. (2010). Class attendance in college: A meta-analytic review of the relationship of class attendance with grades and student characteristics. Review of Educational Research, 80(2), 272-295.",
  },
  {
    id: "cacioppo2009",
    text: "Cacioppo, J.T. & Hawkley, L.C. (2009). Perceived social isolation and cognition. Trends in Cognitive Sciences, 13(10), 447-454.",
  },
  {
    id: "bruening2017",
    text: "Bruening, M., Argo, K., Payne-Sturges, D., & Laska, M.N. (2017). The struggle is real: A systematic review of food insecurity on postsecondary education campuses. Journal of the Academy of Nutrition and Dietetics, 117(11), 1767-1791.",
  },
  {
    id: "yano2015",
    text: "Yano, J.M., Yu, K., Donaldson, G.P., et al. (2015). Indigenous bacteria from the gut microbiota regulate host serotonin biosynthesis. Cell, 161(2), 264-276.",
  },
  {
    id: "hochschild1983",
    text: "Hochschild, A.R. (1983). The Managed Heart: Commercialization of Human Feeling. University of California Press.",
  },
  {
    id: "harkin2016",
    text: "Harkin, B., Webb, T.L., Chang, B.P.I., et al. (2016). Does monitoring goal progress promote goal attainment? A meta-analysis. Psychological Bulletin, 142(2), 198-229.",
  },
  {
    id: "hms2023",
    text: "Healthy Minds Study (2023). Annual Report: The State of Mental Health on College Campuses. Healthy Minds Network.",
  },
  {
    id: "acha2023",
    text: "American College Health Association (2023). National College Health Assessment III: Reference Group Executive Summary. ACHA-NCHA III.",
  },
  {
    id: "apa2023",
    text: "American Psychological Association (2023). Stress in America: A National Mental Health Crisis. APA.",
  },
  {
    id: "weil478",
    text: "Weil, A. (2015). The 4-7-8 Breathing Exercise. Arizona Center for Integrative Medicine. Based on pranayama breathing techniques.",
  },
];

const RESOURCES = [
  { label: "988 Suicide & Crisis Lifeline", url: "tel:988", note: "Call or text 988 — 24/7" },
  { label: "Crisis Text Line", url: "sms:741741", note: "Text HOME to 741741" },
  { label: "NAMI HelpLine", url: "https://www.nami.org/help", note: "1-800-950-6264" },
  { label: "JED Foundation", url: "https://jedfoundation.org", note: "Student mental health resources" },
  { label: "Active Minds", url: "https://www.activeminds.org", note: "Peer-to-peer support" },
  { label: "SAMHSA Helpline", url: "https://www.samhsa.gov/find-help/national-helpline", note: "1-800-662-4357" },
];

export function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedSection(expandedSection === id ? null : id);

  return (
    <div className="px-5 pt-8 pb-20 space-y-1 border-t border-white/5 mt-8">
      <FooterSection
        id="about"
        icon={<Heart size={14} />}
        title="About Aasha"
        expanded={expandedSection === "about"}
        onToggle={() => toggle("about")}
      >
        <p className="text-xs text-white/40 leading-relaxed">
          Aasha (आशा, meaning "hope" in Hindi) is a behavioral awareness companion for students and professionals. 
          It uses the 3-4-4 breathing method (adapted from pranayama) and behavioral micro-tracking to help you notice 
          patterns before they become crises. Aasha is not a diagnostic tool, therapy replacement, or clinical 
          intervention. It is a mirror — reflecting your own data back to you with context from peer-reviewed research.
        </p>
        <p className="text-xs text-white/30 leading-relaxed mt-3">
          The Chhaya (छाया, meaning "shadow") system tracks behavioral signals — sleep disruption, class attendance, 
          social isolation, nutrition patterns, and emotional masking — that research has identified as early 
          indicators of declining wellbeing in college populations.
        </p>
      </FooterSection>

      <FooterSection
        id="resources"
        icon={<Shield size={14} />}
        title="Crisis Resources"
        expanded={expandedSection === "resources"}
        onToggle={() => toggle("resources")}
      >
        <p className="text-[10px] text-white/25 mb-3 leading-relaxed">
          If you or someone you know is in crisis, reach out. You are not alone.
        </p>
        <div className="space-y-2">
          {RESOURCES.map(r => (
            <a
              key={r.label}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 transition-all group"
            >
              <div>
                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">{r.label}</span>
                <span className="text-[10px] text-white/25 block">{r.note}</span>
              </div>
              <ExternalLink size={12} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
            </a>
          ))}
        </div>
      </FooterSection>

      <FooterSection
        id="references"
        icon={<BookOpen size={14} />}
        title="Research References"
        expanded={expandedSection === "references"}
        onToggle={() => toggle("references")}
      >
        <p className="text-[10px] text-white/25 mb-3 leading-relaxed">
          All behavioral signals and insights in Aasha are grounded in peer-reviewed research. Below are the primary sources.
        </p>
        <div className="space-y-2.5">
          {REFERENCES.map((ref, i) => (
            <div key={ref.id} className="flex gap-2 text-[10px] text-white/30 leading-relaxed">
              <span className="text-white/15 flex-shrink-0">[{i + 1}]</span>
              <span>{ref.text}</span>
            </div>
          ))}
        </div>
      </FooterSection>

      <div className="pt-6 text-center space-y-2">
        <p className="text-[9px] text-white/15 font-display tracking-[0.3em] uppercase">
          Aasha · आशा · Hope
        </p>
        <p className="text-[9px] text-white/10 leading-relaxed max-w-[250px] mx-auto">
          Not a diagnosis. Not therapy. A behavioral mirror grounded in research.
        </p>
      </div>
    </div>
  );
}

function FooterSection({
  id, icon, title, expanded, onToggle, children,
}: {
  id: string; icon: React.ReactNode; title: string;
  expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/3 transition-colors"
      >
        <span className="text-white/25">{icon}</span>
        <span className="text-[10px] font-display tracking-[0.25em] uppercase text-white/30 flex-1">{title}</span>
        {expanded ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
