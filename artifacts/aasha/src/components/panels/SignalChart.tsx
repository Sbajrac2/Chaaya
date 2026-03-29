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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-2">
        {data.map(item => {
          const percentGood = totalDays === 0 ? 0 : (item.good / totalDays) * 100;
          const percentBad = 100 - percentGood;
          // Donut chart constants
          const radius = 32;
          const stroke = 8;
          const circ = 2 * Math.PI * radius;
          const goodLen = (percentGood / 100) * circ;
          const badLen = circ - goodLen;
          return (
            <div key={item.name} className="flex flex-col items-center gap-2 bg-white/2 rounded-2xl p-4 shadow-sm">
              <svg width={80} height={80} viewBox="0 0 80 80" className="mb-1">
                <circle
                  cx={40}
                  cy={40}
                  r={radius}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth={stroke}
                />
                <circle
                  cx={40}
                  cy={40}
                  r={radius}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={stroke}
                  strokeDasharray={`${goodLen} ${circ}`}
                  strokeDashoffset={circ * 0.25}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.4,2,.6,1)' }}
                />
                {percentBad > 0 && (
                  <circle
                    cx={40}
                    cy={40}
                    r={radius}
                    fill="none"
                    stroke="#fca5a5"
                    strokeWidth={stroke}
                    strokeDasharray={`${badLen} ${circ}`}
                    strokeDashoffset={circ * 0.25 + goodLen}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(.4,2,.6,1)' }}
                  />
                )}
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="15"
                  fill="#fff"
                  fontWeight="bold"
                >
                  {Math.round(percentGood)}%
                </text>
              </svg>
              <div className="text-xs text-white/70 font-semibold mb-1">{item.name}</div>
              <div className="flex gap-2 text-[10px] text-white/40 mb-1">
                <span className="rounded-full px-2 py-0.5 bg-emerald-500/10 text-emerald-400">{item.good} Good</span>
                <span className="rounded-full px-2 py-0.5 bg-rose-500/10 text-rose-400">{item.bad} Tough</span>
              </div>
              <p className="text-[10px] text-white/40 leading-relaxed text-center">{item.insight}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
