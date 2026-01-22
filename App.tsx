
import React, { useState, useCallback, useEffect } from 'react';
import { MatchReport } from './types';
import { parseLiveTagProXML } from './parser';
import MatchHeader from './components/MatchHeader';
import StatsSection from './components/StatsSection';
import PossessionCharts from './components/PossessionCharts';
import AITacticalAnalysis from './components/AITacticalAnalysis';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const App: React.FC = () => {
  const [report, setReport] = useState<MatchReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedReport = parseLiveTagProXML(content);
        setReport(parsedReport);
      } catch (err) {
        console.error("XML Parsing Error:", err);
        setError("Erro ao processar o arquivo XML. Certifique-se de que é um formato válido do Live Tag Pro.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.onerror = () => {
      setError("Erro ao ler o arquivo selecionado.");
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleExportPDF = async () => {
    if (!report) return;
    
    setIsExporting(true);
    const element = document.getElementById('printable-report');
    if (!element) {
      setIsExporting(false);
      return;
    }

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1200,
        onclone: (clonedDoc) => {
          // Converter inputs para texto estático no clone do PDF
          const inputs = clonedDoc.querySelectorAll('input');
          inputs.forEach((input) => {
            const span = clonedDoc.createElement('span');
            span.textContent = input.value;
            span.className = input.className;
            span.style.display = 'inline-block';
            span.style.color = window.getComputedStyle(input).color;
            span.style.fontFamily = window.getComputedStyle(input).fontFamily;
            span.style.fontSize = window.getComputedStyle(input).fontSize;
            span.style.fontWeight = window.getComputedStyle(input).fontWeight;
            if (input.parentNode) input.parentNode.replaceChild(span, input);
          });

          const clonedReport = clonedDoc.getElementById('printable-report');
          if (clonedReport) {
            clonedReport.style.width = '1200px';
            clonedReport.style.margin = '0';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgProps = pdf.getImageProperties(imgData);
      const canvasHeightInPdfUnits = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = canvasHeightInPdfUnits;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, canvasHeightInPdfUnits);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - canvasHeightInPdfUnits;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, canvasHeightInPdfUnits);
        heightLeft -= pdfHeight;
      }
      
      const fileName = `Analise_Elite_${report.header.homeTeam}_vs_${report.header.awayTeam}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Erro ao gerar PDF. Verifique os dados e tente novamente.");
    } finally {
      setIsExporting(false);
    }
  };

  const updateHeader = useCallback((updates: Partial<MatchReport['header']>) => {
    setReport(prev => {
      if (!prev) return null;
      return { ...prev, header: { ...prev.header, ...updates } };
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-12 pb-24">
      {/* Portal de Upload Profissional */}
      <div className="no-print relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-white rounded-2xl p-10 md:p-16 text-center space-y-10 border border-slate-200 shadow-xl">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-lg border-b-4 border-blue-500">
              <i className="fa-solid fa-bolt-lightning text-blue-500 text-3xl"></i>
            </div>
            <h1 className="text-3xl md:text-5xl font-black oswald uppercase text-slate-900 tracking-tight">Performance Analytics Portal</h1>
            <p className="text-slate-500 mt-3 text-[12px] font-bold uppercase tracking-[0.3em]">DAO COIMBRA • PROFESSIONAL ENGINE</p>
          </div>

          <div className="flex flex-col items-center gap-5">
            <label className="cursor-pointer bg-slate-900 hover:bg-blue-600 text-white font-black oswald py-5 px-14 rounded-sm transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-4 uppercase tracking-[0.2em] text-[12px]">
              <i className="fa-solid fa-file-code text-lg"></i>
              IMPORTAR XML LIVE TAG PRO
              <input type="file" accept=".xml" className="hidden" onChange={handleFileUpload} />
            </label>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">Processamento de métricas em tempo real via Vercel Edge</span>
          </div>

          {isProcessing && <div className="text-blue-600 font-black text-[10px] uppercase tracking-widest animate-pulse">Analizando instâncias de jogo...</div>}
          {error && <div className="text-red-600 text-[10px] font-black uppercase bg-red-50 p-5 border border-red-100 max-w-md mx-auto">{error}</div>}
        </div>
      </div>

      {report && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Barra de Controles de Exportação */}
          <div className="no-print flex justify-between items-center bg-slate-900 p-6 rounded-sm shadow-2xl border-l-4 border-blue-600">
            <div className="flex flex-col">
              <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">SISTEMA DE RELATÓRIOS</span>
              <span className="text-white oswald font-bold uppercase text-lg">{report.header.homeTeam} vs {report.header.awayTeam}</span>
            </div>
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="group flex items-center gap-4 bg-blue-600 text-white px-8 py-4 rounded-sm oswald font-black uppercase tracking-[0.2em] text-[12px] transition-all hover:bg-blue-500 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isExporting ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
              {isExporting ? 'GERANDO...' : 'EXPORTAR PDF COMPLETO'}
            </button>
          </div>

          {/* Documento Principal */}
          <div id="printable-report" className="bg-white shadow-2xl border border-slate-200 overflow-hidden mx-auto" style={{ minWidth: '1000px', width: '100%' }}>
            <MatchHeader header={report.header} onUpdate={updateHeader} />
            
            <div className="p-8 md:p-16 space-y-20">
              {/* Nova Seção: Inteligência Artificial */}
              <AITacticalAnalysis report={report} />

              <div className="space-y-20">
                <StatsSection title="Análise Geral da Partida" stats={report.total} />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
                  <StatsSection title="Métricas 1º Tempo" stats={report.p1} compact />
                  <StatsSection title="Métricas 2º Tempo" stats={report.p2} compact />
                </div>
              </div>
              
              <PossessionCharts stats={report.total} />

              {/* Rodapé do Documento */}
              <div className="pt-12 border-t border-slate-100 flex justify-between items-center bg-white">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">DATA DE EMISSÃO</span>
                  <span className="text-[11px] font-bold text-slate-500">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="bg-[#020617] text-white px-8 py-4 relative">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                   <span className="text-[13px] font-black oswald uppercase tracking-[0.2em]">DAO Coimbra • MSC. Vitor Rezende</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">VERIFIED PERFORMANCE DATA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
