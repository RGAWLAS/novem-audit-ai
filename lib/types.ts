export type Goal =
  | 'sales_growth'
  | 'lead_gen'
  | 'new_market'
  | 'product_launch'
  | 'brand_awareness';

export type Budget = 'lt_10k' | '10k_30k' | '30k_50k' | 'gt_50k';

export type Measurement =
  | 'gut_feel'
  | 'basic_ga'
  | 'kpi_dashboards'
  | 'full_attribution';

export const GOAL_LABELS: Record<Goal, string> = {
  sales_growth: 'Wzrost sprzedaży',
  lead_gen: 'Generowanie leadów sprzedażowych',
  new_market: 'Wejście na nowy rynek lub segment',
  product_launch: 'Launch nowego produktu/linii',
  brand_awareness: 'Budowa rozpoznawalności marki',
};

export const BUDGET_LABELS: Record<Budget, string> = {
  lt_10k: 'do 10 000 zł',
  '10k_30k': '10 000 – 30 000 zł',
  '30k_50k': '30 000 – 50 000 zł',
  gt_50k: 'powyżej 50 000 zł',
};

export const MEASUREMENT_LABELS: Record<Measurement, string> = {
  gut_feel: 'Na wyczucie / nie mamy twardych danych',
  basic_ga: 'Podstawowa Google Analytics — ruch i konwersje',
  kpi_dashboards: 'Dashboardy z KPI na poziomie kanału',
  full_attribution: 'Pełna atrybucja przychodów + LTV + CAC po segmentach',
};

export interface LeadForm {
  url: string;
  goal: Goal | '';
  budget: Budget | '';
  measurement: Measurement | '';
  name: string;
  email: string;
  consent: boolean;
}

export interface ScrapeSignals {
  url: string;
  domain: string;
  title?: string;
  h1?: string;
  metaDescription?: string;
  language?: string;
  hasGTM: boolean;
  hasGA4: boolean;
  hasMetaPixel: boolean;
  hasLinkedInInsight: boolean;
  hasHotjar: boolean;
  hasClarity: boolean;
  hasCookieBanner: boolean;
  socialLinks: string[];
  ctas: string[];
  hasBlog: boolean;
  hasContactForm: boolean;
  hasLeadMagnet: boolean;
  techStack: string[];
}

export interface AdSignals {
  googleAdsActive: boolean;
  googleAdsCount: number;
  metaAdsActive: boolean;
  metaAdsCount: number;
  sampleAds: { platform: string; text?: string; image?: string }[];
}

export interface RadarScores {
  tracking: number;
  paidAcquisition: number;
  organicPresence: number;
  conversion: number;
  retention: number;
  measurement: number;
}

export interface Finding {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  impact?: string;
}

export interface Report {
  id: string;
  createdAt: string;
  form: LeadForm;
  scrape: ScrapeSignals;
  ads: AdSignals;
  business: {
    industry: string;
    model: string;
    geo: string;
    stage: string;
    icp: string;
  };
  radar: RadarScores;
  strengths: Finding[];
  gaps: Finding[];
  recommendation: {
    headline: string;
    rationale: string;
    plan: string[];
    estimatedImpact: string;
  };
  cta: {
    headline: string;
    calLink: string;
  };
}
