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
    { 
      name: 'Sleep', 
      bad: lateNights, 
      good: totalDays - lateNights,
      insight: lateNights > totalDays / 2 ? 
        "Late nights could indicate stress, anxiety, or poor sleep habits. This might affect your energy and focus. Consider drafting an email to your professor for an extension, or find a sanctuary spot to recharge." :
        "Good sleep patterns detected! Keep it up for better mental clarity."
    },
    { 
      name: 'Attendance', 
      bad: lowAttendance, 
      good: totalDays - lowAttendance,
      insight: lowAttendance > totalDays / 2 ?
        "Low attendance might be due to burnout or health issues. It's okay to prioritize your well-being. I can help draft an email explaining your situation to your professor." :
        "Strong attendance shows commitment. You're doing great!"
    },
    { 
      name: 'Isolation', 
      bad: isolated, 
      good: totalDays - isolated,
      insight: isolated > totalDays / 2 ?
        "Staying isolated could be a sign of needing space, but too much might increase feelings of loneliness. Try connecting with friends or use the sanctuary feature for a peaceful moment." :
        "Good balance of social interaction and alone time."
    },
    { 
      name: 'Nutrition', 
      bad: poorNutrition, 
      good: totalDays - poorNutrition,
      insight: poorNutrition > totalDays / 2 ?
        "Poor nutrition can impact your mood and energy. Stress might be affecting your eating habits. Consider reaching out for support or finding ways to make healthy eating easier." :
        "Healthy eating habits are supporting your well-being!"
    },
    { 
      name: 'Masking', 
      bad: highMasking, 
      good: totalDays - highMasking,
      insight: highMasking > totalDays / 2 ?
        "High masking levels suggest you're putting on a front, which can be exhausting. It's brave to show up. If this feels overwhelming, I can help draft an email for accommodations or mental health support." :
        "Authentic self-expression is a strength. Keep being you!"
    },
  ];

  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-2">
      <p className="text-[9px] font-display tracking-[0.3em] uppercase text-white/25">Your Habits at a Glance</p>
      <div className="space-y-4 pt-2">
        {data.map(item => (
          <div key={item.name} className="space-y-2">
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
            <p className="text-[10px] text-white/40 leading-relaxed">{item.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
