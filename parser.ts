
import { TagEvent, Team, Period, MatchReport, PeriodStats, StatRow } from './types';

// Helper to remove accents and lowercase for robust comparison
const normalize = (str: string): string => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

export const parseLiveTagProXML = (xmlString: string): MatchReport => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  const instances = xmlDoc.getElementsByTagName("instance");
  
  const events: TagEvent[] = [];

  for (let i = 0; i < instances.length; i++) {
    const inst = instances[i];
    const code = inst.getElementsByTagName("code")[0]?.textContent || "";
    const start = parseFloat(inst.getElementsByTagName("start")[0]?.textContent || "0");
    const end = parseFloat(inst.getElementsByTagName("end")[0]?.textContent || "0");
    const id = inst.getElementsByTagName("ID")[0]?.textContent || i.toString();
    
    let team: string | undefined;
    let periodLabel: string | undefined;

    const labels = inst.getElementsByTagName("label");
    for (let j = 0; j < labels.length; j++) {
      const group = labels[j].getElementsByTagName("group")[0]?.textContent;
      const text = labels[j].getElementsByTagName("text")[0]?.textContent;
      
      if (group === "Team") team = text || undefined;
      if (group === "Label") periodLabel = text || undefined;
    }

    events.push({ id, code, start, end, team, periodLabel });
  }

  const calculateStatsForPeriod = (periodName: string): PeriodStats => {
    // Filter events by period label
    const periodEvents = events.filter(e => e.periodLabel === periodName);

    const getCount = (code: string, teamFilter: string) => {
      const normalizedTarget = normalize(teamFilter);
      return periodEvents.filter(e => {
        const normalizedCode = normalize(e.code);
        const codeMatch = normalizedCode === normalize(code);
        
        // Match by team label OR check if team name is inside the code (some XMLs do this)
        const teamMatch = (e.team && normalize(e.team) === normalizedTarget) || 
                          normalizedCode.includes(normalizedTarget);
        
        return codeMatch && teamMatch;
      }).length;
    };

    const indicators: StatRow[] = [
      { label: 'Gol', coimbra: getCount('Gol', Team.COIMBRA), adversario: getCount('Gol', Team.ADVERSARIO) },
      { label: 'Finalização', coimbra: getCount('Finalização', Team.COIMBRA), adversario: getCount('Finalização', Team.ADVERSARIO) },
      { label: 'Finalização no Gol', coimbra: getCount('Finalização no Gol', Team.COIMBRA), adversario: getCount('Finalização no Gol', Team.ADVERSARIO) },
      { label: 'Finalização Fora/Bloq.', coimbra: getCount('Finalização Para Fora/Bloqueada', Team.COIMBRA), adversario: getCount('Finalização Para Fora/Bloqueada', Team.ADVERSARIO) },
      { label: 'Cruzamento', coimbra: getCount('Cruzamento', Team.COIMBRA), adversario: getCount('Cruzamento', Team.ADVERSARIO) },
      { label: 'Impedimento', coimbra: getCount('Impedimento', Team.COIMBRA), adversario: getCount('Impedimento', Team.ADVERSARIO) },
      { label: 'Falta Cometida', coimbra: getCount('Falta Cometida', Team.COIMBRA), adversario: getCount('Falta Cometida', Team.ADVERSARIO) },
      { label: 'Escanteio', coimbra: getCount('Escanteio', Team.COIMBRA), adversario: getCount('Escanteio', Team.ADVERSARIO) },
      { label: 'Tiro de Meta', coimbra: getCount('Tiro de Meta', Team.COIMBRA), adversario: getCount('Tiro de Meta', Team.ADVERSARIO) },
      { label: 'Cartão Amarelo', coimbra: getCount('Cartão Amarelo', Team.COIMBRA), adversario: getCount('Cartão Amarelo', Team.ADVERSARIO) },
      { label: 'Cartão Vermelho', coimbra: getCount('Cartão Vermelho', Team.COIMBRA), adversario: getCount('Cartão Vermelho', Team.ADVERSARIO) },
    ];

    // Possession logic using normalized comparison
    const coimbraPoss = periodEvents
      .filter(e => normalize(e.code).includes("posse de bola coimbra"))
      .reduce((acc, curr) => acc + (curr.end - curr.start), 0);
    
    const adversarioPoss = periodEvents
      .filter(e => normalize(e.code).includes("posse de bola adversario"))
      .reduce((acc, curr) => acc + (curr.end - curr.start), 0);

    const effectiveTime = periodEvents
      .filter(e => normalize(e.code) === "bola em jogo")
      .reduce((acc, curr) => acc + (curr.end - curr.start), 0);

    const outTime = periodEvents
      .filter(e => normalize(e.code) === "bola fora do jogo")
      .reduce((acc, curr) => acc + (curr.end - curr.start), 0);

    const periodMarker = periodEvents.find(e => normalize(e.code) === normalize(periodName));
    const totalTime = periodMarker ? (periodMarker.end - periodMarker.start) : (effectiveTime + outTime);

    return {
      period: periodName,
      indicators,
      possession: {
        coimbraSeconds: coimbraPoss,
        adversarioSeconds: adversarioPoss,
        effectiveSeconds: effectiveTime,
        outSeconds: outTime,
        totalSeconds: totalTime || 1
      }
    };
  };

  const p1Stats = calculateStatsForPeriod(Period.P1);
  const p2Stats = calculateStatsForPeriod(Period.P2);

  const totalIndicators: StatRow[] = p1Stats.indicators.map((p1Ind, idx) => {
    const p2Ind = p2Stats.indicators[idx];
    return {
      label: p1Ind.label,
      coimbra: p1Ind.coimbra + p2Ind.coimbra,
      adversario: p1Ind.adversario + p2Ind.adversario
    };
  });

  const totalStats: PeriodStats = {
    period: Period.TOTAL,
    indicators: totalIndicators,
    possession: {
      coimbraSeconds: p1Stats.possession.coimbraSeconds + p2Stats.possession.coimbraSeconds,
      adversarioSeconds: p1Stats.possession.adversarioSeconds + p2Stats.possession.adversarioSeconds,
      effectiveSeconds: p1Stats.possession.effectiveSeconds + p2Stats.possession.effectiveSeconds,
      outSeconds: p1Stats.possession.outSeconds + p2Stats.possession.outSeconds,
      totalSeconds: p1Stats.possession.totalSeconds + p2Stats.possession.totalSeconds
    }
  };

  const coimbraGoals = totalStats.indicators.find(i => i.label === 'Gol')?.coimbra || 0;
  const adversarioGoals = totalStats.indicators.find(i => i.label === 'Gol')?.adversario || 0;

  return {
    header: {
      homeTeam: Team.COIMBRA,
      awayTeam: "Adversário",
      date: new Date().toLocaleDateString('pt-BR'),
      competition: "CAMPEONATO NACIONAL",
      score: `${coimbraGoals} - ${adversarioGoals}`
    },
    p1: p1Stats,
    p2: p2Stats,
    total: totalStats
  };
};
