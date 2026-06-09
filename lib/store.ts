import type { LeadForm, Report, ScrapeSignals, AdSignals } from './types';

type Pending = {
  id: string;
  form: LeadForm;
  scrape?: ScrapeSignals;
  ads?: AdSignals;
  report?: Report;
  status: 'pending' | 'scraping' | 'analyzing' | 'ready' | 'error';
  steps: { key: string; label: string; done: boolean }[];
  error?: string;
};

// In-memory store for MVP. Replace with Supabase when keys are ready.
const g = globalThis as unknown as { __novemStore?: Map<string, Pending> };
export const store: Map<string, Pending> = g.__novemStore ?? new Map();
g.__novemStore = store;

export const DEFAULT_STEPS = [
  { key: 'scrape_site', label: 'Skanuję Waszą stronę i tracking…', done: false },
  { key: 'scrape_ads', label: 'Sprawdzam reklamy w Google Ads Transparency…', done: false },
  { key: 'scrape_meta', label: 'Pobieram reklamy z Meta Ad Library…', done: false },
  { key: 'competitors', label: 'Identyfikuję 3–5 konkurentów…', done: false },
  { key: 'synthesize', label: 'AI pisze Wasz raport…', done: false },
];

export function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
