import { useState } from "react";
import { useGetCheckins } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, TrendingDown, Moon, Users, Utensils, Activity } from "lucide-react";

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

export function ChhayaPanel({ sessionId, userName }: ChhayaPanelProps) {
  const { data: checkins, isLoading } = useGetCheckins(
    { sessionId, limit: 100 },
    { query: { enabled: !!sessionId, refetchOnMount: true } }
  );
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-white/30">
        <Loader2 className="w-6 h-6 animate-spin" />
        <p className="text-[10px] font-display tracking-[0.3em] uppercase">Analyzing patterns...</p>
      </div>
    );
  }

  const all = checkins ?? [];
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
  const olderLateRate = older7.length > 0 ? older7.filter(c => c.isLateNight).length / older7.length : 0;

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
      description: `${lateNightCount} late-night check-ins detected. Research shows even one hour less sleep measurably affects focus, emotional regulation, and academic performance. Your body is running on reduced capacity.`,
      severity: recentLateRate > 0.5 ? "alert" : "warning",
    });
  }

  if (missedClassCount > 1 && (olderAttendRate - recentAttendRate) > 0.15) {
    signals.push({
      id: "attendance",
      icon: <TrendingDown size={18} className="text-amber-400" />,
      title: "attendance drop",
      description: `Attending ${Math.round(recentAttendRate * 100)}% recently vs ${Math.round(olderAttendRate * 100)}% before. Class avoidance is one of the earliest measurable signals of academic stress — not laziness, but your nervous system pulling away from perceived threat.`,
      severity: recentAttendRate < 0.5 ? "alert" : "warning",
    });
  }

  if (isolationCount > 2 || recentIsoRate > 0.3) {
    signals.push({
      id: "isolation",
      icon: <Users size={18} className="text-teal-400" />,
      title: "isolation",
      description: `You've been staying in your room more than your usual pattern. Voluntary isolation is one of the most well-documented signs of declining wellbeing in college students. Your nervous system needs co-regulation.`,
      severity: recentIsoRate > 0.5 ? "alert" : "warning",
    });
  }

  if (skippedMealsCount > 2 || recentMealSkipRate > 0.3) {
    signals.push({
      id: "nutrition",
      icon: <Utensils size={18} className="text-emerald-400" />,
      title: "nutrition",
      description: `Skipping meals more than usual. 90% of serotonin is produced in the gut. Irregular eating patterns are linked to increased stress, low mood, and reduced self-prioritization. This isn't about discipline — it's biology.`,
      severity: recentMealSkipRate > 0.5 ? "alert" : "warning",
    });
  }

  if (avgMaskNum > 3.2 || (recentMask - olderMask) > 0.5) {
    signals.push({
      id: "masking",
      icon: <Activity size={18} className="text-violet-400" />,
      title: "performance gap",
      description: `The gap between how you feel inside and how you show up has ${recentMask > olderMask ? "widened" : "been consistently high"} (${avgMasking}/5). This emotional masking has a real energy cost that compounds over time. You deserve spaces where you can just be.`,
      severity: avgMaskNum > 4 ? "alert" : "warning",
    });
  }

  if (signals.length === 0 && all.length > 0) {
    signals.push({
      id: "steady",
      icon: <Activity size={18} className="text-emerald-400" />,
      title: "steady patterns",
      description: "Your behavioral patterns are stable. No significant shifts detected. Keep checking in — Chhaya watches so you don't have to.",
      severity: "notice",
    });
  }

  const calendarDays = buildCalendar(all);

  return (
    <div className="flex flex-col h-full px-5 pt-3 pb-16 overflow-y-auto space-y-5">
      <div className="space-y-1">
        <p className="text-[10px] font-display tracking-[0.3em] uppercase text-white/20">
          Chhaya · Your patterns
        </p>
        <p className="text-xs text-white/35">
          {totalDays} day{totalDays !== 1 ? "s" : ""} tracked · Week {academicWeek} of semester
        </p>
      </div>

      {academicWeek >= 7 && (
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
            Attendance — last {totalDays} days
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

      <p className="text-[10px] text-white/15 text-center pt-2 leading-relaxed">
        Based on your behavioral patterns — not a diagnosis. Never a diagnosis.
      </p>
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
