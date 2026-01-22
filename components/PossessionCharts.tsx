
import React from 'react';
import { PeriodStats } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface PossessionChartsProps {
  stats: PeriodStats;
}

const PossessionCharts: React.FC<PossessionChartsProps> = ({ stats }) => {
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const totalEffective = stats.possession.coimbraSeconds + stats.possession.adversarioSeconds;
  const coimbraPerc = totalEffective > 0 ? Math.round((stats.possession.coimbraSeconds / totalEffective) * 100) : 0;
  const adversarioPerc = totalEffective > 0 ? 100 - coimbraPerc : 0;

  const possessionData = [
    { name: 'Coimbra', value: stats.possession.coimbraSeconds, color: '#0050FF' },
    { name: 'Adversário', value: stats.possession.adversarioSeconds, color: '#cbd5e1' }
  ];

  return (
    <div className="bg-white border border-slate-200 shadow-sm print-break-inside-avoid">
      <div className="bg-[#020617] text-white px-6 py-3 uppercase text-[12px] font-black tracking-[0.2em] flex items-center gap-3">
        <div className="w-1 h-5 bg-blue-500"></div>
        DINÂMICA DE POSSE E FLUXO TEMPORAL
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Circle Possession Gauge */}
        <div className="p-10 md:p-14 flex flex-col items-center">
          <div className="h-56 w-56 md:h-72 md:w-72 relative">
            <div className="absolute -inset-4 border border-blue-500/10 rounded-full"></div>
            
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={possessionData}
                  innerRadius="75%"
                  outerRadius="95%"
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {possessionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-6xl font-black oswald text-[#020617]">{coimbraPerc}%</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">DOMÍNIO</span>
            </div>
          </div>
          
          <div className="w-full grid grid-cols-2 gap-8 mt-12">
            <div className="flex flex-col border-l-3 border-blue-600 pl-5">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">COIMBRA FC</span>
               <span className="text-2xl font-black oswald text-[#020617]">{formatTime(stats.possession.coimbraSeconds)}</span>
            </div>
            <div className="flex flex-col border-l-3 border-slate-300 pl-5">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ADVERSÁRIO</span>
               <span className="text-2xl font-black oswald text-slate-600">{formatTime(stats.possession.adversarioSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Temporal Bars */}
        <div className="p-10 md:p-14 flex flex-col justify-center space-y-10">
          <div className="space-y-8">
             <div className="group">
                <div className="flex justify-between items-end mb-3">
                   <div className="flex flex-col">
                      <span className="text-[12px] font-black uppercase text-slate-400 tracking-widest">Tempo Efetivo</span>
                      <span className="text-xl font-black oswald text-blue-600">{formatTime(stats.possession.effectiveSeconds)}</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">{( (stats.possession.effectiveSeconds / stats.possession.totalSeconds) * 100 ).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 overflow-hidden relative">
                   <div 
                    className="h-full bg-blue-600 transition-all duration-1000" 
                    style={{ width: `${(stats.possession.effectiveSeconds / stats.possession.totalSeconds) * 100}%` }}
                   ></div>
                </div>
             </div>

             <div className="group">
                <div className="flex justify-between items-end mb-3">
                   <div className="flex flex-col">
                      <span className="text-[12px] font-black uppercase text-slate-400 tracking-widest">Bola fora de jogo</span>
                      <span className="text-xl font-black oswald text-slate-600">{formatTime(stats.possession.outSeconds)}</span>
                   </div>
                   <span className="text-[10px] font-bold text-slate-400">{( (stats.possession.outSeconds / stats.possession.totalSeconds) * 100 ).toFixed(1)}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 overflow-hidden relative">
                   <div 
                    className="h-full bg-slate-300 transition-all duration-1000" 
                    style={{ width: `${(stats.possession.outSeconds / stats.possession.totalSeconds) * 100}%` }}
                   ></div>
                </div>
             </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-300">
                   <i className="fa-solid fa-clock text-xs"></i>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duração Total</span>
             </div>
             <span className="text-4xl font-black oswald text-[#020617] tabular-nums tracking-tighter">
                {formatTime(stats.possession.totalSeconds)}
             </span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PossessionCharts;
