import { useState, useMemo } from "react";
import { useGetCheckins } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, TrendingDown, Moon, Users, Utensils, Activity, FlaskConical } from "lucide-react";
import { Footer } from "@/components/Footer";

interface ChhayaPanelProps {
  sessionId: string;
  userName: string;
}

interface Signal {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  severity: "notice" | "warning" | "alert";
}

interface DayData {
  date: string;
  label: string;
  attended: number;
  masking: number;
  wellbeing: number;
  lateNight: boolean;
  leftRoom: boolean;
  ateWell: boolean;
  count: number;
  sleepScore: number;
}

function getAcademicWeek(): { week: number; label: string } {
  const now = new Date();
  const month = now.getMonth() + 1;
  let week = 7;
  if (month >= 1 && month <= 5) {
    const start = new Date(now.getFullYear(), 0, 13);
    week = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  } else if (month >= 8 && month <= 12) {
    const start = new Date(now.getFullYear(), 7, 26);
    week = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)));
  }
  let label = "";
  if (week >= 7 && week <= 9) label = "midterm season — one of the most documented stress peaks";
  else if (week >= 13) label = "finals stretch — the hardest weeks of the semester";
  else if (week <= 3) label = "early semester — building your rhythm";
  else label = "mid-semester — deep in the flow";
  return { week, label };
}

function generateDemoCheckins(): any[] {
  const now = new Date();
  const checkins: any[] = [];
  for (let i = 20; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const stress = i < 7 ? 0.6 : i < 14 ? 0.4 : 0.2;

    checkins.push({
      id: `demo-${i}`,
      sessionId: "demo",
      attendedClass: isWeekend ? true : Math.random() > stress * 0.6,
      ateWell: Math.random() > stress * 0.5,
      maskingLevel: Math.min(5, Math.max(1, Math.round(1 + stress * 4 + (Math.random() - 0.5) * 2))),
      holdDurationMs: 10000 + Math.random() * 2000,
      interactionLatencyMs: 200 + Math.random() * 300,
      isLateNight: Math.random() < stress * 0.7,
      leftRoom: Math.random() > stress * 0.4,
      hadSunlightExposure: Math.random() > 0.3,
      completedTask: Math.random() > stress * 0.4,
      createdAt: d.toISOString(),
    });
  }
  return checkins;
}

function aggregateByDay(checkins: any[]): DayData[] {
  const map = new Map<string, { attended: number; masking: number[]; wellbeing: number[]; lateNight: boolean; leftRoom: boolean; ateWell: boolean; count: number; sleepScores: number[] }>();

  checkins.forEach(c => {
    const d = new Date(c.createdAt);
    const key = d.toISOString().split("T")[0];
    const existing = map.get(key) || { attended: 0, masking: [], wellbeing: [], lateNight: false, leftRoom: true, ateWell: true, count: 0, sleepScores: [] };
    existing.attended += c.attendedClass ? 1 : 0;
    existing.masking.push(c.maskingLevel ?? 0);
    const wb = (c.attendedClass ? 1 : 0) + (c.ateWell ? 1 : 0) + ((c as any).leftRoom !== false ? 1 : 0) + (c.maskingLevel < 3 ? 1 : 0) + (!c.isLateNight ? 1 : 0);
    existing.wellbeing.push(wb);
    const sleep = c.isLateNight ? 4 + Math.random() * 2 : 6.5 + Math.random() * 2;
    existing.sleepScores.push(sleep);
    if (c.isLateNight) existing.lateNight = true;
    if ((c as any).leftRoom === false) existing.leftRoom = false;
    if (!c.ateWell) existing.ateWell = false;
    existing.count++;
    map.set(key, existing);
  });

  const days: DayData[] = [];
  map.forEach((v, key) => {
    const d = new Date(key + "T12:00:00");
    days.push({
      date: key,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      attended: v.count > 0 ? v.attended / v.count : 0,
      masking: v.masking.length > 0 ? v.masking.reduce((a, b) => a + b, 0) / v.masking.length : 0,
      wellbeing: v.wellbeing.length > 0 ? v.wellbeing.reduce((a, b) => a + b, 0) / v.wellbeing.length : 0,
      lateNight: v.lateNight,
      leftRoom: v.leftRoom,
      ateWell: v.ateWell,
      count: v.count,
      sleepScore: v.sleepScores.length > 0 ? v.sleepScores.reduce((a, b) => a + b, 0) / v.sleepScores.length : 7,
    });
  });

  days.sort((a, b) => a.date.localeCompare(b.date));
  return days.slice(-21);
}

function aggregateByWeek(dayData: DayData[]): { label: string; attendance: number; masking: number; lateNights: number; wellbeing: number; days: number }[] {
  const weeks: Map<string, { attendance: number[]; masking: number[]; lateNights: number; wellbeing: number[]; days: number; start: string }> = new Map();

  dayData.forEach(d => {
    const date = new Date(d.date + "T12:00:00");
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    const key = weekStart.toISOString().split("T")[0];
    const existing = weeks.get(key) || { attendance: [], masking: [], lateNights: 0, wellbeing: [], days: 0, start: key };
    existing.attendance.push(d.attended);
    existing.masking.push(d.masking);
    if (d.lateNight) existing.lateNights++;
    existing.wellbeing.push(d.wellbeing);
    existing.days++;
    weeks.set(key, existing);
  });

  return Array.from(weeks.values()).map(w => {
    const wStart = new Date(w.start + "T12:00:00");
    return {
      label: `${wStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      attendance: w.attendance.length > 0 ? Math.round((w.attendance.reduce((a, b) => a + b, 0) / w.attendance.length) * 100) : 0,
      masking: w.masking.length > 0 ? +(w.masking.reduce((a, b) => a + b, 0) / w.masking.length).toFixed(1) : 0,
      lateNights: w.lateNights,
      wellbeing: w.wellbeing.length > 0 ? +(w.wellbeing.reduce((a, b) => a + b, 0) / w.wellbeing.length).toFixed(1) : 0,
      days: w.days,
    };
  });
}

function DualLineChart({ data }: { data: DayData[] }) {
  if (data.length < 2) return null;
  const w = 300;
  const h = 100;
  const px = 30;
  const py = 14;
  const chartW = w - px * 2;
  const chartH = h - py * 2;

  const sleepPoints = data.map((d, i) => ({
    x: px + (i / (data.length - 1)) * chartW,
    y: py + chartH - (Math.min(d.sleepScore, 10) / 10) * chartH,
    label: d.label,
    value: d.sleepScore,
  }));

  const maskPoints = data.map((d, i) => ({
    x: px + (i / (data.length - 1)) * chartW,
    y: py + chartH - (d.masking / 5) * chartH,
    label: d.label,
    value: d.masking,
  }));

  const makePath = (pts: typeof sleepPoints) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  const makeArea = (pts: typeof sleepPoints) => {
    const pathD = makePath(pts);
    return `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${h} L ${pts[0].x.toFixed(1)} ${h} Z`;
  };

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/25">Sleep & masking — daily</p>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-[8px] text-indigo-400/60"><span className="w-3 h-0.5 rounded bg-indigo-400/60 inline-block" /> Sleep</span>
          <span className="flex items-center gap-1 text-[8px] text-violet-400/60"><span className="w-3 h-0.5 rounded bg-violet-400/60 inline-block" /> Masking</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 100 }}>
        <defs>
          <linearGradient id="grad-sleep" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="grad-mask-dual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[2, 4, 6, 8].map(v => (
          <line key={v} x1={px} y1={py + chartH - (v / 10) * chartH} x2={w - px} y2={py + chartH - (v / 10) * chartH} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        ))}
        <text x={px - 4} y={py + 4} textAnchor="end" fontSize="6" fill="rgba(255,255,255,0.15)">10h</text>
        <text x={px - 4} y={py + chartH / 2 + 2} textAnchor="end" fontSize="6" fill="rgba(255,255,255,0.15)">5h</text>
        <text x={px - 4} y={py + chartH + 4} textAnchor="end" fontSize="6" fill="rgba(255,255,255,0.15)">0</text>

        <path d={makeArea(sleepPoints)} fill="url(#grad-sleep)" />
        <path d={makePath(sleepPoints)} fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />

        <path d={makeArea(maskPoints)} fill="url(#grad-mask-dual)" />
        <path d={makePath(maskPoints)} fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" strokeDasharray="4 3" />

        {sleepPoints.map((p, i) => (
          <circle key={`s${i}`} cx={p.x} cy={p.y} r="2.5" fill="#818cf8" opacity="0.8">
            <title>{`${p.label}: ${p.value.toFixed(1)}h sleep`}</title>
          </circle>
        ))}
        {maskPoints.map((p, i) => (
          <circle key={`m${i}`} cx={p.x} cy={p.y} r="2.5" fill="#a78bfa" opacity="0.8">
            <title>{`${p.label}: ${p.value.toFixed(1)}/5 masking`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[8px] text-white/20 px-1">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

function WeeklyGroupedBarChart({ weeks }: { weeks: ReturnType<typeof aggregateByWeek> }) {
  if (weeks.length < 1) return null;
  const w = 300;
  const h = 130;
  const px = 8;
  const py = 12;
  const chartH = h - py - 28;
  const groupW = (w - px * 2) / weeks.length;
  const barW = Math.min(14, groupW / 4 - 2);

  const metrics = [
    { key: "attendance" as const, color: "rgba(52,211,153,0.6)", label: "Attend %", max: 100 },
    { key: "masking" as const, color: "rgba(167,139,250,0.6)", label: "Masking", max: 5 },
    { key: "lateNights" as const, color: "rgba(129,140,248,0.5)", label: "Late", max: 7 },
  ];

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/25">Weekly averages</p>
        <div className="flex gap-2">
          {metrics.map(m => (
            <span key={m.key} className="flex items-center gap-1 text-[7px] text-white/30">
              <span className="w-2 h-2 rounded-sm inline-block" style={{ background: m.color }} />
              {m.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 130 }}>
        {weeks.map((week, wi) => {
          const groupX = px + wi * groupW;
          return (
            <g key={wi}>
              {metrics.map((m, mi) => {
                const val = week[m.key];
                const normalized = Math.min(val / m.max, 1);
                const barH = Math.max(2, normalized * chartH);
                const x = groupX + (groupW - barW * 3 - 4) / 2 + mi * (barW + 2);
                const y = py + chartH - barH;
                return (
                  <g key={m.key}>
                    <rect x={x} y={y} width={barW} height={barH} rx={2} fill={m.color}>
                      <title>{`${week.label} — ${m.label}: ${val}${m.key === "attendance" ? "%" : m.key === "masking" ? "/5" : ""}`}</title>
                    </rect>
                    {wi === 0 && (
                      <text x={x + barW / 2} y={py + chartH + 20} textAnchor="middle" fontSize="5" fill="rgba(255,255,255,0.12)">
                        {m.label}
                      </text>
                    )}
                  </g>
                );
              })}
              <text x={groupX + groupW / 2} y={py + chartH + 12} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.2)">
                {week.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MiniLineChart({ data, color, maxY, label, unit }: { data: { x: number; y: number; label: string }[]; color: string; maxY: number; label: string; unit?: string }) {
  if (data.length < 2) return null;
  const w = 300;
  const h = 80;
  const px = 8;
  const py = 10;
  const chartW = w - px * 2;
  const chartH = h - py * 2;

  const points = data.map((d, i) => ({
    x: px + (i / (data.length - 1)) * chartW,
    y: py + chartH - (d.y / maxY) * chartH,
    label: d.label,
    value: d.y,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${h} L ${points[0].x.toFixed(1)} ${h} Z`;

  const gradId = `grad-${label.replace(/\s/g, "")}`;

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
      <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/25">{label}</p>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 80 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#${gradId})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} opacity="0.9">
            <title>{`${p.label}: ${p.value.toFixed(1)}${unit || ""}`}</title>
          </circle>
        ))}
      </svg>
      <div className="flex justify-between text-[8px] text-white/20 px-1">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}

export function ChhayaPanel({ sessionId, userName }: ChhayaPanelProps) {
  const { data: checkins, isLoading } = useGetCheckins(
    { sessionId, limit: 100 },
    { query: { enabled: !!sessionId, refetchOnMount: true } }
  );
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [useDemo, setUseDemo] = useState(false);

  const demoCheckins = useMemo(() => generateDemoCheckins(), []);
  const realCheckins = useMemo(() => checkins ?? [], [checkins]);
  const all = useDemo ? demoCheckins : realCheckins;
  const dayData = useMemo(() => aggregateByDay(all), [all]);
  const weekData = useMemo(() => aggregateByWeek(dayData), [dayData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-[10px] font-display tracking-[0.3em] uppercase">Analyzing patterns...</p>
      </div>
    );
  }

  if (realCheckins.length === 0 && !useDemo) {
    return (
      <div className="flex flex-col h-full px-5 pt-3 pb-16 overflow-y-auto">
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Activity size={28} className="text-white/20" />
          </div>
          <div className="space-y-2 max-w-[260px]">
            <p className="text-base text-white/60 font-light">No check-ins yet</p>
            <p className="text-xs text-white/30 leading-relaxed">
              Hold the orb for 10 seconds to do your first check-in. Chhaya will start tracking your patterns.
            </p>
          </div>
          <button
            onClick={() => setUseDemo(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-300/70 hover:bg-violet-500/20 transition-all text-xs font-display tracking-widest uppercase"
          >
            <FlaskConical size={14} />
            Preview with demo data
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const totalDays = new Set(all.map(c => new Date(c.createdAt).toISOString().split("T")[0])).size;
  const { week: academicWeek, label: weekLabel } = getAcademicWeek();

  const attendedCount = all.filter(c => c.attendedClass).length;
  const attendanceRate = all.length > 0 ? Math.round((attendedCount / all.length) * 100) : 0;
  const avgMasking = all.length > 0
    ? (all.reduce((s, c) => s + c.maskingLevel, 0) / all.length).toFixed(1)
    : "—";

  const lateNightCount = all.filter(c => c.isLateNight).length;
  const isolationCount = all.filter(c => (c as any).leftRoom === false).length;
  const skippedMealsCount = all.filter(c => !c.ateWell).length;
  const missedClassCount = all.filter(c => !c.attendedClass).length;
  const avgMaskNum = all.length > 0 ? all.reduce((s, c) => s + c.maskingLevel, 0) / all.length : 0;

  const recent7 = all.slice(0, 7);
  const older7 = all.slice(7, 14);

  const recentLateRate = recent7.length > 0 ? recent7.filter(c => c.isLateNight).length / recent7.length : 0;

  const recentAttendRate = recent7.length > 0 ? recent7.filter(c => c.attendedClass).length / recent7.length : 1;
  const olderAttendRate = older7.length > 0 ? older7.filter(c => c.attendedClass).length / older7.length : 1;

  const recentIsoRate = recent7.length > 0 ? recent7.filter(c => (c as any).leftRoom === false).length / recent7.length : 0;
  const recentMealSkipRate = recent7.length > 0 ? recent7.filter(c => !c.ateWell).length / recent7.length : 0;

  const recentMask = recent7.length > 0 ? recent7.reduce((s, c) => s + c.maskingLevel, 0) / recent7.length : 0;
  const olderMask = older7.length > 0 ? older7.reduce((s, c) => s + c.maskingLevel, 0) / older7.length : 0;

  const signals: Signal[] = [];

  if (lateNightCount > 2 || recentLateRate > 0.4) {
    signals.push({
      id: "sleep",
      icon: <Moon size={18} className="text-indigo-400" />,
      title: "sleep shift",
      description: `${lateNightCount} late-night check-ins detected. Could be homework overload, insomnia, stress-induced wakefulness, circadian rhythm disruption, or social patterns keeping you up. The Healthy Minds Study (2023) found that 60% of college students report insufficient sleep, with each lost hour reducing next-day cognitive performance by 25% (Lund et al., Sleep, 2010). Your body is running on reduced capacity — and that's not a character flaw, it's physiology.`,
      severity: recentLateRate > 0.5 ? "alert" : "warning",
    });
  }

  if (missedClassCount > 1 && (olderAttendRate - recentAttendRate) > 0.15) {
    signals.push({
      id: "attendance",
      icon: <TrendingDown size={18} className="text-amber-400" />,
      title: "attendance drop",
      description: `Attending ${Math.round(recentAttendRate * 100)}% recently vs ${Math.round(olderAttendRate * 100)}% before. The question isn't "why aren't you going" — it's what's making it hard. Academic overwhelm? Social anxiety? Feeling behind and ashamed? Credé et al. (2010, Review of Educational Research) found class attendance is the single strongest predictor of GPA — stronger than SAT scores. This isn't about discipline. Your nervous system is pulling away from perceived threat.`,
      severity: recentAttendRate < 0.5 ? "alert" : "warning",
    });
  }

  if (isolationCount > 2 || recentIsoRate > 0.3) {
    signals.push({
      id: "isolation",
      icon: <Users size={18} className="text-teal-400" />,
      title: "isolation pattern",
      description: `You've been staying in more than your usual pattern. Why? Could be social withdrawal from depression, sensory overwhelm, feeling like a burden, or simply needing to recharge. Cacioppo & Hawkley (2009, Annals of Behavioral Medicine) showed perceived social isolation increases cortisol by 20% and accelerates cognitive decline. The ACHA National College Health Assessment (2023) reports 44% of students felt "so lonely it was hard to function." Your nervous system needs co-regulation — connection isn't optional, it's biological.`,
      severity: recentIsoRate > 0.5 ? "alert" : "warning",
    });
  }

  if (skippedMealsCount > 2 || recentMealSkipRate > 0.3) {
    signals.push({
      id: "nutrition",
      icon: <Utensils size={18} className="text-emerald-400" />,
      title: "nutrition shift",
      description: `Skipping meals more than usual. Why? Could be food insecurity (39% of college students experience it — Bruening et al., 2017, Journal of Nutrition Education and Behavior), disordered eating patterns, budget constraints, no time between obligations, or depression suppressing appetite. 90% of serotonin is produced in the gut (Yano et al., Cell, 2015). Irregular eating is linked to increased anxiety and reduced academic performance. This isn't about willpower — it's your body asking for what it needs.`,
      severity: recentMealSkipRate > 0.5 ? "alert" : "warning",
    });
  }

  if (avgMaskNum > 3.2 || (recentMask - olderMask) > 0.5) {
    signals.push({
      id: "masking",
      icon: <Activity size={18} className="text-violet-400" />,
      title: "authenticity gap",
      description: `The gap between who you are inside and who you show the world has ${recentMask > olderMask ? "widened" : "been consistently high"} (${avgMasking}/5). Why the performance? Fear of judgment? Cultural expectations? Imposter syndrome? Emotional labor research (Hochschild, 1983) shows sustained masking depletes the same cognitive resources used for learning. The APA Stress in America Survey (2023) found 65% of young adults hide their true emotional state daily. You deserve spaces where you can just exist without performing.`,
      severity: avgMaskNum > 4 ? "alert" : "warning",
    });
  }

  if (signals.length === 0 && all.length > 0) {
    signals.push({
      id: "steady",
      icon: <Activity size={18} className="text-emerald-400" />,
      title: "steady patterns",
      description: "Your behavioral patterns are stable. No significant shifts detected. Research shows consistent self-monitoring alone improves outcomes (Harkin et al., 2016, Psychological Bulletin). Keep checking in — Chhaya watches so you don't have to.",
      severity: "notice",
    });
  }

  const wellbeingChartData = dayData.map((d, i) => ({ x: i, y: d.wellbeing, label: d.label }));

  const calendarDays = buildCalendar(all);

  return (
    <div className="flex flex-col h-full px-5 pt-3 pb-16 overflow-y-auto space-y-5">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20">
            Chhaya · Your patterns
          </p>
          <p className="text-xs text-white/35">
            {totalDays} day{totalDays !== 1 ? "s" : ""} tracked · Week {academicWeek} of semester
          </p>
        </div>
        <button
          onClick={() => setUseDemo(!useDemo)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-[9px] font-display tracking-widest uppercase ${
            useDemo
              ? "bg-violet-500/15 border-violet-500/25 text-violet-300/70"
              : "bg-white/4 border-white/8 text-white/30 hover:text-white/50"
          }`}
          title={useDemo ? "Showing demo data — click to see your data" : "Click to preview with demo data"}
        >
          <FlaskConical size={12} />
          {useDemo ? "Demo" : "My data"}
        </button>
      </div>

      {useDemo && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-2.5 rounded-xl bg-violet-500/8 border border-violet-500/15"
        >
          <p className="text-[10px] text-violet-300/50 leading-relaxed">
            Previewing with 21 sample check-ins so you can see what Chhaya looks like with data. Your real data will appear once you start checking in.
          </p>
        </motion.div>
      )}

      {academicWeek >= 7 && !useDemo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl bg-violet-500/8 border border-violet-500/15"
        >
          <p className="text-xs text-white/50 leading-relaxed">
            You are in <span className="text-violet-300/80">Week {academicWeek}</span> — {weekLabel}. What you are feeling is real, predictable, and temporary.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Attendance" value={`${attendanceRate}%`} />
        <StatCard label="Avg gap" value={`${avgMasking}/5`} />
        <StatCard label="Late nights" value={`${lateNightCount}`} />
      </div>

      {dayData.length >= 2 && (
        <div className="space-y-3">
          <DualLineChart data={dayData} />
          <WeeklyGroupedBarChart weeks={weekData} />
          <MiniLineChart
            data={wellbeingChartData}
            color="#34d399"
            maxY={5}
            label="Wellbeing trend"
            unit="/5"
          />
        </div>
      )}

      {signals.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-violet-500/50 animate-pulse" />
            Chhaya has noticed
          </p>
          {signals.map((signal) => (
            <motion.button
              key={signal.id}
              onClick={() => setExpandedSignal(expandedSignal === signal.id ? null : signal.id)}
              className="w-full text-left"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`rounded-xl border px-4 py-3 transition-all duration-300 ${
                signal.severity === "alert"
                  ? "bg-red-500/5 border-red-500/15"
                  : signal.severity === "warning"
                  ? "bg-amber-500/5 border-amber-500/12"
                  : "bg-emerald-500/5 border-emerald-500/12"
              }`}>
                <div className="flex items-center gap-3">
                  {signal.icon}
                  <span className="text-sm text-white/60 font-medium flex-1">{signal.title}</span>
                  {signal.severity !== "notice" && (
                    <AlertTriangle size={14} className={
                      signal.severity === "alert" ? "text-red-400/60" : "text-amber-400/40"
                    } />
                  )}
                </div>
                <AnimatePresence>
                  {expandedSignal === signal.id && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="text-xs text-white/40 leading-relaxed mt-3 overflow-hidden"
                    >
                      {signal.description}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {all.length > 3 && (
        <div className="space-y-3">
          <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20">
            Signal heatmap — last {Math.min(30, all.length)} check-ins
          </p>
          <div className="flex gap-1 flex-wrap">
            {all.slice(0, 30).reverse().map((c, i) => {
              const signalCount = (!c.attendedClass ? 1 : 0) + (!c.ateWell ? 1 : 0) +
                ((c as any).leftRoom === false ? 1 : 0) + (c.maskingLevel >= 4 ? 1 : 0) + (c.isLateNight ? 1 : 0);
              return (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`w-5 h-5 rounded-sm ${
                    signalCount === 0 ? "bg-emerald-500/40"
                    : signalCount === 1 ? "bg-amber-500/30"
                    : signalCount === 2 ? "bg-orange-500/35"
                    : "bg-red-500/30"
                  }`}
                  title={new Date(c.createdAt).toLocaleDateString()}
                />
              );
            })}
          </div>
          <div className="flex gap-3 text-[9px] text-white/25">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/40" /> Strong</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30" /> 1 signal</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500/35" /> 2</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/30" /> 3+</span>
          </div>
        </div>
      )}

      {all.length >= 3 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-[10px] font-display tracking-[0.3em] uppercase text-violet-400/50 hover:text-violet-400/80 transition-colors"
          >
            {showCalendar ? "Hide calendar" : "Show calendar view"}
          </button>
          <AnimatePresence>
            {showCalendar && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <CalendarView days={calendarDays} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <Footer />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/4 border border-white/8 rounded-xl px-3 py-3 text-center">
      <p className="text-lg font-display font-light text-white/70">{value}</p>
      <p className="text-[9px] font-display tracking-widest uppercase text-white/25 mt-1">{label}</p>
    </div>
  );
}

interface CalendarDay {
  date: string;
  dayNum: number;
  hasCheckin: boolean;
  signalCount: number;
  attended: boolean;
}

function buildCalendar(checkins: any[]): CalendarDay[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const checkinMap = new Map<string, { signalCount: number; attended: boolean }>();
  checkins.forEach(c => {
    const key = new Date(c.createdAt).toISOString().split("T")[0];
    const existing = checkinMap.get(key);
    const signals = (!c.attendedClass ? 1 : 0) + (!c.ateWell ? 1 : 0) +
      ((c as any).leftRoom === false ? 1 : 0) + (c.maskingLevel >= 4 ? 1 : 0) + (c.isLateNight ? 1 : 0);
    if (!existing || signals > existing.signalCount) {
      checkinMap.set(key, { signalCount: signals, attended: c.attendedClass });
    }
  });

  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const key = dateObj.toISOString().split("T")[0];
    const info = checkinMap.get(key);
    days.push({
      date: key,
      dayNum: d,
      hasCheckin: !!info,
      signalCount: info?.signalCount ?? 0,
      attended: info?.attended ?? false,
    });
  }
  return days;
}

function CalendarView({ days }: { days: CalendarDay[] }) {
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long", year: "numeric" });
  const firstDayOfWeek = new Date(now.getFullYear(), now.getMonth(), 1).getDay();

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
      <p className="text-xs text-white/50 text-center font-display tracking-wider">{monthName}</p>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i} className="text-[9px] text-white/20 font-display py-1">{d}</span>
        ))}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <span key={`pad-${i}`} />
        ))}
        {days.map((day) => (
          <div
            key={day.dayNum}
            className={`w-full aspect-square rounded-md flex items-center justify-center text-[10px] transition-all ${
              !day.hasCheckin
                ? "bg-white/3 text-white/15"
                : day.signalCount === 0
                ? "bg-emerald-500/25 text-emerald-300/70"
                : day.signalCount <= 1
                ? "bg-amber-500/20 text-amber-300/60"
                : day.signalCount <= 2
                ? "bg-orange-500/20 text-orange-300/60"
                : "bg-red-500/20 text-red-300/60"
            }`}
          >
            {day.dayNum}
          </div>
        ))}
      </div>
    </div>
  );
}
