import React from 'react';

interface SignalChartProps {
  signals: any[];
  dayData: any[];
}

export function SignalChart({ signals, dayData }: SignalChartProps) {
  const totalDays = dayData.length;

  const lateNights = dayData.filter(d => d.lateNight).length;
  const lowAttendance = dayData.filter(d => d.attended < 0.5).length;
  const isolated = dayData.filter(d => !d.leftRoom).length;
  const poorNutrition = dayData.filter(d => !d.ateWell).length;
  const highMasking = dayData.filter(d => d.masking > 3).length;

  const data = [
    { name: 'Sleep', bad: lateNights, good: totalDays - lateNights },
    { name: 'Attendance', bad: lowAttendance, good: totalDays - lowAttendance },
    { name: 'Isolation', bad: isolated, good: totalDays - isolated },
    { name: 'Nutrition', bad: poorNutrition, good: totalDays - poorNutrition },
    { name: 'Masking', bad: highMasking, good: totalDays - highMasking },
  ];

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
      <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/25">Your Habits at a Glance</p>
      <div className="space-y-4 pt-2">
        {data.map(item => (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between items-center text-xs text-white/50">
              <span>{item.name}</span>
              <span className="text-[10px]">{item.good} good days, {item.bad} tough days</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-white/10">
              <div
                className="bg-emerald-500/70"
                style={{ width: `${(item.good / totalDays) * 100}%` }}
                title={`${item.good} good days`}
              />
              <div
                className="bg-red-500/70"
                style={{ width: `${(item.bad / totalDays) * 100}%` }}
                title={`${item.bad} tough days`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
