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

/**
 * Tri-state signal. We never collapse "we couldn't check" into "absent":
 *  - confirmed     → we positively detected it
 *  - not_detected  → we successfully looked and it was not there
 *  - unknown       → we could not verify (page unreachable, GTM container unreadable, …)
 */
export type SignalState = 'confirmed' | 'not_detected' | 'unknown';

export const SIGNAL_LABELS: Record<SignalState, string> = {
  confirmed: 'wykryto',
  not_detected: 'brak',
  unknown: 'nie zweryfikowano',
};

export interface ScrapeSignals {
  url: string;
  domain: string;
  /** Did we get a usable (2xx) HTML response? When false every signal below is `unknown`. */
  reachable: boolean;
  /** Reason the site could not be scanned (HTTP status / network error). */
  fetchError?: string;
  /** Whether a GTM container was found and successfully parsed (Droga 1). */
  gtmContainerChecked: boolean;
  title?: string;
  h1?: string;
  metaDescription?: string;
  language?: string;
  gtm: SignalState;
  ga4: SignalState;
  metaPixel: SignalState;
  linkedInInsight: SignalState;
  hotjar: SignalState;
  clarity: SignalState;
  cookieBanner: SignalState;
  socialLinks: string[];
  ctas: string[];
  hasBlog: boolean;
  hasContactForm: boolean;
  hasLeadMagnet: boolean;
  techStack: string[];
}

export interface AdSignals {
  /** confirmed = active ads found · not_detected = checked, none · unknown = could not check. */
  google: SignalState;
  googleAdsCount: number;
  /** Meta Ad Library integration not wired yet → always `unknown` (never faked as "none"). */
  meta: SignalState;
  metaAdsCount: number;
  sampleAds: { platform: string; text?: string; image?: string }[];
  googleAdsMeta?: { formats: Record<string, number>; first?: string; last?: string };
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
