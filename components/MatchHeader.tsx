
import React, { useRef } from 'react';

interface MatchHeaderProps {
  header: {
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string;
    awayLogo?: string;
    date: string;
    competition: string;
    score: string;
  };
  onUpdate: (updates: Partial<MatchHeaderProps['header']>) => void;
}

const MatchHeader: React.FC<MatchHeaderProps> = ({ header, onUpdate }) => {
  const homeLogoInput = useRef<HTMLInputElement>(null);
  const awayLogoInput = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'home' | 'away') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (side === 'home') onUpdate({ homeLogo: result });
        else onUpdate({ awayLogo: result });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  return (
    <div className="relative overflow-hidden bg-[#020617] text-white">
      {/* Inputs */}
      <input type="file" ref={homeLogoInput} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'home')} />
      <input type="file" ref={awayLogoInput} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'away')} />

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_#0050FF,_transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_right,_#0050FF,_transparent_50%)]"></div>
      </div>

      <div className="relative z-10 border-b border-white/10 bg-black/40 px-6 py-3 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
        <div className="flex items-center gap-3">
          <span className="text-blue-500">LIVE TAG PRO ENGINE</span>
          <input 
            value={header.competition} 
            onChange={(e) => onUpdate({ competition: e.target.value })}
            className="bg-transparent border-none focus:outline-none min-w-[220px] hover:bg-white/5 transition-colors rounded px-2 font-bold text-white uppercase"
          />
        </div>
        <span className="opacity-70">PERFORMANCE DOCUMENT • CONFIDENCIAL</span>
      </div>

      <div className="relative z-10 px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          
          {/* Home Team */}
          <div className="flex-1 flex flex-col items-center md:items-end gap-6 w-full">
             <div 
              onClick={() => homeLogoInput.current?.click()}
              className="group relative w-32 h-32 md:w-44 md:h-44 bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-all hover:bg-white/10 overflow-hidden"
            >
              {header.homeLogo ? (
                <img src={header.homeLogo} alt="Logo Home" className="w-full h-full object-contain p-4" />
              ) : (
                <div className="flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity">
                  <i className="fa-solid fa-shield text-3xl mb-2"></i>
                  <span className="text-[10px] font-bold">CARREGAR ESCUDO</span>
                </div>
              )}
            </div>
            <input 
              value={header.homeTeam} 
              onChange={(e) => onUpdate({ homeTeam: e.target.value })}
              className="bg-transparent text-center md:text-right text-3xl md:text-5xl font-black oswald uppercase tracking-tight focus:outline-none w-full text-white"
            />
          </div>

          {/* Score HUD */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative bg-blue-600 px-12 py-6 shadow-[0_15px_40px_rgba(0,0,0,0.5)] transform -skew-x-6 border-2 border-blue-400">
              <input 
                value={header.score} 
                onChange={(e) => onUpdate({ score: e.target.value })}
                className="bg-transparent text-center text-6xl md:text-8xl font-black oswald tracking-tighter w-48 focus:outline-none text-white transform skew-x-6"
              />
            </div>
            <div className="mt-8 flex flex-col items-center gap-1">
              <input 
                value={header.date}
                onChange={(e) => onUpdate({ date: e.target.value })}
                className="bg-transparent text-center text-[14px] font-black text-blue-400 uppercase tracking-[0.3em] focus:outline-none w-full"
              />
              <div className="h-0.5 w-12 bg-blue-500/30"></div>
            </div>
          </div>

          {/* Away Team */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-6 w-full">
            <div 
              onClick={() => awayLogoInput.current?.click()}
              className="group relative w-32 h-32 md:w-44 md:h-44 bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer transition-all hover:bg-white/10 overflow-hidden"
            >
              {header.awayLogo ? (
                <img src={header.awayLogo} alt="Logo Away" className="w-full h-full object-contain p-4" />
              ) : (
                <div className="flex flex-col items-center opacity-30 group-hover:opacity-60 transition-opacity">
                  <i className="fa-solid fa-shield text-3xl mb-2"></i>
                  <span className="text-[10px] font-bold">CARREGAR ESCUDO</span>
                </div>
              )}
            </div>
            <input 
              value={header.awayTeam} 
              onChange={(e) => onUpdate({ awayTeam: e.target.value })}
              className="bg-transparent text-center md:text-left text-3xl md:text-5xl font-black oswald uppercase tracking-tight focus:outline-none w-full text-white"
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default MatchHeader;