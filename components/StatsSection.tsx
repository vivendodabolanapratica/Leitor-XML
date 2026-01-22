
import React from 'react';
import { PeriodStats } from '../types';

interface StatsSectionProps {
  title: string;
  stats: PeriodStats;
  compact?: boolean;
}

const StatsSection: React.FC<StatsSectionProps> = ({ title, stats, compact }) => {
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 print-break-inside-avoid">
      {/* Card Header */}
      <div className={`flex justify-between items-center bg-[#020617] text-white px-6 py-4 uppercase font-black tracking-[0.2em] relative ${compact ? 'text-[11px]' : 'text-[16px]'}`}>
        <div className="flex items-center gap-3">
          <div className={`bg-blue-500 ${compact ? 'w-1 h-4' : 'w-1.5 h-7'}`}></div>
          {title}
        </div>
        <div className="opacity-60 text-[10px]">DURAÇÃO: {formatTime(stats.possession.totalSeconds)}</div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0"></div>
      </div>
      
      <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100">
          {stats.indicators.map((indicator, idx) => {
            const isWinnerHome = indicator.coimbra > indicator.adversario;
            const isWinnerAway = indicator.adversario > indicator.coimbra;
            const total = indicator.coimbra + indicator.adversario;

            return (
              <div key={idx} className="relative group transition-all hover:bg-slate-50/50">
                <div className={`flex items-center px-6 md:px-10 relative z-10 ${compact ? 'h-16' : 'h-20'}`}>
                  
                  {/* Left Value */}
                  <div className={`flex-1 text-right pr-6 md:pr-12 oswald font-bold transition-all ${compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} ${isWinnerHome ? 'text-blue-600 scale-105' : 'text-slate-400 opacity-60'}`}>
                    {indicator.coimbra}
                  </div>

                  {/* Label (Center) */}
                  <div className={`${compact ? 'w-[180px] md:w-[280px]' : 'w-[240px] md:w-[380px]'} flex-shrink-0 text-center flex flex-col items-center`}>
                    <span className={`font-black uppercase text-slate-700 tracking-[0.05em] leading-tight mb-2 ${compact ? 'text-[12px] md:text-[14px]' : 'text-[16px] md:text-[20px]'}`}>
                      {indicator.label}
                    </span>
                    {/* Visual Balance Bar */}
                    <div className={`${compact ? 'h-[3px] max-w-[160px]' : 'h-[5px] max-w-[220px]'} w-full bg-slate-100 rounded-full flex overflow-hidden`}>
                        <div 
                          className={`h-full transition-all duration-700 ${isWinnerHome ? 'bg-blue-600' : 'bg-slate-300'}`} 
                          style={{ width: `${total > 0 ? (indicator.coimbra / total) * 100 : 50}%` }}
                        ></div>
                        <div 
                          className={`h-full transition-all duration-700 ${isWinnerAway ? 'bg-slate-600' : 'bg-slate-200'}`} 
                          style={{ width: `${total > 0 ? (indicator.adversario / total) * 100 : 50}%` }}
                        ></div>
                    </div>
                  </div>

                  {/* Right Value */}
                  <div className={`flex-1 text-left pl-6 md:pl-12 oswald font-bold transition-all ${compact ? 'text-3xl md:text-4xl' : 'text-4xl md:text-5xl'} ${isWinnerAway ? 'text-slate-900 scale-105' : 'text-slate-400 opacity-60'}`}>
                    {indicator.adversario}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
