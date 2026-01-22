
export enum Team {
  COIMBRA = 'Coimbra Fc Porto',
  ADVERSARIO = 'Adversario'
}

export enum Period {
  P1 = '1º Tempo',
  P2 = '2º Tempo',
  TOTAL = 'Total'
}

export interface TagEvent {
  id: string;
  code: string;
  start: number;
  end: number;
  team?: Team | string;
  periodLabel?: string;
}

export interface StatRow {
  label: string;
  coimbra: number;
  adversario: number;
}

export interface PeriodStats {
  period: string;
  indicators: StatRow[];
  possession: {
    coimbraSeconds: number;
    adversarioSeconds: number;
    effectiveSeconds: number;
    outSeconds: number;
    totalSeconds: number;
  };
}

export interface MatchReport {
  header: {
    homeTeam: string;
    awayTeam: string;
    homeLogo?: string; // Base64 string
    awayLogo?: string; // Base64 string
    date: string;
    competition: string;
    score: string;
  };
  p1: PeriodStats;
  p2: PeriodStats;
  total: PeriodStats;
}
