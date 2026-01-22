
import React, { useState, useEffect } from 'react';
import { MatchReport } from '../types';
import { GoogleGenAI } from "@google/genai";

interface AITacticalAnalysisProps {
  report: MatchReport;
}

const AITacticalAnalysis: React.FC<AITacticalAnalysisProps> = ({ report }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `
        Aja como um analista de desempenho de futebol profissional. 
        Analise os seguintes dados da partida entre ${report.header.homeTeam} e ${report.header.awayTeam}:
        
        Placar: ${report.header.score}
        Posse de Bola (Coimbra): ${Math.round((report.total.possession.coimbraSeconds / (report.total.possession.coimbraSeconds + report.total.possession.adversarioSeconds)) * 100)}%
        Estatísticas: ${JSON.stringify(report.total.indicators)}
        
        Forneça um resumo tático de 3 parágrafos curtos:
        1. Análise do controle do jogo e posse.
        2. Eficácia ofensiva e volume de finalizações.
        3. Sugestões de melhoria para o próximo ciclo de treinos.
        
        Seja técnico, direto e profissional. Use português do Brasil.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAnalysis(response.text || 'Análise indisponível no momento.');
    } catch (error) {
      console.error("AI Error:", error);
      setAnalysis('Ocorreu um erro ao processar a análise via IA. Verifique a conexão ou chave de API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (report) generateAnalysis();
  }, [report]);

  return (
    <div className="bg-slate-50 border border-slate-200 p-8 md:p-10 rounded-sm relative overflow-hidden print-break-inside-avoid">
      <div className="absolute top-0 right-0 p-4">
        <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full">
          <i className="fa-solid fa-robot"></i>
          AI INSIGHTS
        </div>
      </div>
      
      <h3 className="text-[#020617] oswald font-bold uppercase text-2xl mb-6 flex items-center gap-4">
        <span className="w-1.5 h-8 bg-blue-600"></span>
        Análise Tática Automatizada
      </h3>

      {loading ? (
        <div className="space-y-4">
          <div className="h-4 bg-slate-200 animate-pulse w-3/4"></div>
          <div className="h-4 bg-slate-200 animate-pulse w-full"></div>
          <div className="h-4 bg-slate-200 animate-pulse w-5/6"></div>
        </div>
      ) : (
        <div className="text-slate-600 text-[15px] leading-relaxed font-medium whitespace-pre-wrap">
          {analysis}
        </div>
      )}
      
      <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <span>Processado por Gemini Elite Engine</span>
        <span className="italic">Confidencial • Apenas para uso técnico</span>
      </div>
    </div>
  );
};

export default AITacticalAnalysis;
