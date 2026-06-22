import type {
  AdSignals,
  Budget,
  Finding,
  Goal,
  LeadForm,
  Measurement,
  RadarScores,
  Report,
  ScrapeSignals,
  SignalState,
} from './types';
import { BUDGET_LABELS, GOAL_LABELS, MEASUREMENT_LABELS } from './types';

/** True only when we positively detected the signal — `unknown` never counts as present. */
const on = (s: SignalState) => s === 'confirmed';
/** True only when we successfully checked and it was genuinely absent. */
const off = (s: SignalState) => s === 'not_detected';

/**
 * Heuristic synthesis — always runs. If ANTHROPIC_API_KEY is set we additionally
 * ask Claude to refine the narrative text. The deterministic core guarantees a sane report
 * even without the LLM (useful for dev + as a fallback).
 */
export async function synthesize(args: {
  id: string;
  form: LeadForm;
  scrape: ScrapeSignals;
  ads: AdSignals;
}): Promise<Report> {
  const { id, form, scrape, ads } = args;
  const radar = computeRadar(scrape, ads, form.measurement as Measurement);
  const business = inferBusiness(scrape);
  const strengths = findStrengths(scrape, ads);
  const gaps = findGaps(scrape, ads, form);
  const recommendation = buildRecommendation(form, scrape, ads, gaps);

  const base: Report = {
    id,
    createdAt: new Date().toISOString(),
    form,
    scrape,
    ads,
    business,
    radar,
    strengths,
    gaps,
    recommendation,
    cta: {
      headline: 'Porozmawiajmy o tych rekomendacjach — 30 minut z senior strategiem Novem.',
      calLink: process.env.NOVEM_CAL_LINK || 'https://novem.pl/kontakt',
    },
  };

  // Optional LLM polish layer
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const polished = await polishWithClaude(base);
      return polished;
    } catch {
      return base;
    }
  }
  return base;
}

function computeRadar(s: ScrapeSignals, a: AdSignals, m: Measurement | ''): RadarScores {
  // 0–10 per axis. Only `confirmed` signals earn points; `unknown` never inflates a
  // score (and never silently penalises as if absent — that nuance lives in the findings).
  const tracking =
    (on(s.gtm) ? 2 : 0) +
    (on(s.ga4) ? 2.5 : 0) +
    (on(s.metaPixel) ? 2 : 0) +
    (on(s.linkedInInsight) ? 1.5 : 0) +
    (on(s.hotjar) || on(s.clarity) ? 2 : 0);

  const paidAcquisition =
    (on(a.google) ? 5 : 0) + (on(a.meta) ? 4 : 0) + Math.min(1, a.googleAdsCount * 0.1);

  const organicPresence =
    (s.hasBlog ? 3 : 0) +
    Math.min(4, s.socialLinks.length) +
    (s.metaDescription ? 2 : 0) +
    (s.h1 ? 1 : 0);

  const conversion =
    (s.hasContactForm ? 3 : 0) + (s.hasLeadMagnet ? 4 : 0) + Math.min(3, s.ctas.length * 0.6);

  const retention =
    (on(s.metaPixel) ? 3 : 0) +
    (on(s.linkedInInsight) ? 2 : 0) +
    (on(s.ga4) ? 2 : 0) +
    (on(s.cookieBanner) ? 1 : 0) +
    (s.hasBlog ? 2 : 0);

  const measurementMap: Record<Measurement, number> = {
    gut_feel: 1,
    basic_ga: 4,
    kpi_dashboards: 7,
    full_attribution: 10,
  };
  const measurement = m ? measurementMap[m] : 3;

  const clamp = (n: number) => Math.max(0, Math.min(10, Math.round(n * 10) / 10));
  return {
    tracking: clamp(tracking),
    paidAcquisition: clamp(paidAcquisition),
    organicPresence: clamp(organicPresence),
    conversion: clamp(conversion),
    retention: clamp(retention),
    measurement: clamp(measurement),
  };
}

function inferBusiness(s: ScrapeSignals) {
  const title = (s.title || s.h1 || s.domain).toLowerCase();
  const lang = (s.language || 'pl').toLowerCase();
  const isEcom = s.techStack.some((t) =>
    ['Shopify', 'WooCommerce', 'PrestaShop', 'IdoSell', 'Shoper'].includes(t),
  );
  const model = isEcom ? 'E-commerce / B2C' : 'B2B / usługi';
  const geo = lang.startsWith('pl') ? 'Polska (lokalny / krajowy)' : 'Międzynarodowy / EN';
  return {
    industry: s.metaDescription?.slice(0, 140) || title.slice(0, 80) || 'Branża do doprecyzowania',
    model,
    geo,
    stage: 'Scale-up (heurystyka — dopytamy na konsultacji)',
    icp: isEcom ? 'Konsument końcowy (D2C)' : 'Decydent zakupowy w SMB/Enterprise',
  };
}

function findStrengths(s: ScrapeSignals, a: AdSignals): Finding[] {
  const f: Finding[] = [];
  if (on(s.ga4) && on(s.gtm))
    f.push({
      severity: 'info',
      title: 'Tracking foundation OK',
      detail: 'Macie GA4 + GTM — dobre fundamenty do dalszej rozbudowy pomiaru.',
    });
  if (on(a.google)) {
    const meta = a.googleAdsMeta;
    const formatStr = meta?.formats
      ? Object.entries(meta.formats)
          .map(([k, v]) => `${v} ${k.toLowerCase()}`)
          .join(', ')
      : '';
    const window =
      meta?.first && meta?.last
        ? ` Kampanie aktywne od ${meta.first} do ${meta.last}.`
        : '';
    f.push({
      severity: 'info',
      title: `Aktywne reklamy Google (${a.googleAdsCount})`,
      detail: `Google Ads Transparency potwierdza ciągłą akwizycję płatną${
        formatStr ? ` — format: ${formatStr}` : ''
      }.${window}`,
    });
  }
  if (s.socialLinks.length >= 3)
    f.push({
      severity: 'info',
      title: 'Wielokanałowa obecność w social',
      detail: `Linkujecie do ${s.socialLinks.length} platform — dobra dywersyfikacja kontaktu.`,
    });
  if (s.hasBlog)
    f.push({
      severity: 'info',
      title: 'Content marketing w grze',
      detail: 'Aktywny blog daje Wam długoterminowy ruch organiczny i materiał do remarketingu.',
    });
  if (s.hasLeadMagnet)
    f.push({
      severity: 'info',
      title: 'Lead magnet obecny',
      detail: 'Macie magnes leadowy — fundament do top-of-funnel.',
    });
  return f.slice(0, 3);
}

function findGaps(s: ScrapeSignals, a: AdSignals, form: LeadForm): Finding[] {
  const gaps: Finding[] = [];

  // If the site itself was unreachable, every signal is `unknown`. Be honest about
  // it instead of reporting a wall of fake "Brak ..." findings.
  if (!s.reachable) {
    gaps.push({
      severity: 'warning',
      title: 'Nie udało się zeskanować strony',
      detail: `Nie mogliśmy pobrać ${s.domain} (${s.fetchError || 'błąd połączenia'}), więc trackingu nie da się automatycznie zweryfikować. Sprawdzimy go ręcznie na konsultacji.`,
    });
    return gaps;
  }

  // --- Genuine gaps: only when we successfully looked and the signal was absent. ---
  if (off(s.metaPixel))
    gaps.push({
      severity: 'critical',
      title: 'Brak Meta Pixel',
      detail: 'Bez Pixela tracicie możliwość retargetingu w Meta i pomiaru konwersji Meta Ads.',
      impact:
        'Każdy miesiąc bez Pixela to bezpowrotnie utracona pula użytkowników do remarketingu w Meta — tej grupy nie da się odbudować wstecz.',
    });
  if (off(s.ga4))
    gaps.push({
      severity: 'critical',
      title: 'Brak GA4',
      detail: 'Universal Analytics nie istnieje od 2023. Bez GA4 nie macie podstawowego pomiaru ruchu i konwersji.',
      impact: 'Budżet mediowy wydajecie bez danych o tym, które kanały realnie konwertują — optymalizacja opiera się na domysłach.',
    });
  if (off(s.gtm))
    gaps.push({
      severity: 'warning',
      title: 'Brak Google Tag Managera',
      detail: 'Bez GTM każda zmiana tracking-u wymaga developera — to spowalnia testy i blokuje pomiar konwersji.',
    });
  if (off(s.linkedInInsight) && form.measurement && (form.goal === 'lead_gen' || form.goal === 'new_market'))
    gaps.push({
      severity: 'warning',
      title: 'Brak LinkedIn Insight Tag',
      detail:
        'Dla B2B / lead gen LinkedIn jest najdroższym, ale najbardziej precyzyjnym kanałem. Bez Insight Tag nie zoptymalizujecie kampanii.',
    });
  if (off(s.hotjar) && off(s.clarity))
    gaps.push({
      severity: 'warning',
      title: 'Brak narzędzia do behavioral analytics',
      detail:
        'Hotjar / Clarity to darmowy fundament do rozumienia UX. Bez nich nie wiecie, dlaczego użytkownik nie konwertuje.',
    });
  // Meta ads are only flagged when Transparency actually confirmed none — we never
  // check Meta Ad Library yet, so `unknown` produces no claim.
  if (off(a.meta) && (form.goal === 'sales_growth' || form.goal === 'brand_awareness'))
    gaps.push({
      severity: 'warning',
      title: 'Brak aktywnych kampanii Meta',
      detail:
        'Meta Ad Library nie pokazuje Waszych kampanii — przy Waszych celach Meta zwykle daje najlepszy CPM dla zasięgu.',
    });
  if (!s.hasLeadMagnet && form.goal === 'lead_gen')
    gaps.push({
      severity: 'critical',
      title: 'Brak lead magnetu',
      detail:
        'Cel = leady, a strona nie ma magnesu (ebook, raport, kalkulator). Większość ruchu wychodzi bez zostawienia kontaktu.',
    });
  if (!s.hasBlog && form.goal === 'brand_awareness')
    gaps.push({
      severity: 'warning',
      title: 'Brak bloga / content hubu',
      detail: 'Cel świadomościowy bez contentu = drogi zasięg paid bez efektu długoterminowego.',
    });

  // --- Honest "couldn't verify" notes for signals hidden behind an unreadable GTM container. ---
  const unverified: string[] = [];
  if (s.ga4 === 'unknown') unverified.push('GA4');
  if (s.metaPixel === 'unknown') unverified.push('Meta Pixel');
  if (s.linkedInInsight === 'unknown') unverified.push('LinkedIn Insight');
  if (unverified.length)
    gaps.push({
      severity: 'info',
      title: `Tracking do potwierdzenia: ${unverified.join(', ')}`,
      detail:
        'Strona ładuje GTM, ale nie udało nam się odczytać zawartości kontenera, więc tych tagów nie potwierdzamy automatycznie. Zweryfikujemy je ręcznie — nie zakładamy, że ich brakuje.',
    });

  return gaps.slice(0, 5);
}

function buildRecommendation(
  form: LeadForm,
  s: ScrapeSignals,
  a: AdSignals,
  gaps: Finding[],
): Report['recommendation'] {
  const budget = form.budget as Budget;
  const goal = form.goal as Goal;
  const m = form.measurement as Measurement;

  // Matrix headline by budget × goal
  const headlines: Record<Goal, string> = {
    sales_growth: 'Plan: maksymalizacja ROAS na istniejącym ruchu + skalowanie najlepszych kanałów',
    lead_gen: 'Plan: zbudowanie funnela B2B z wielowarstwowym remarketingiem i lead scoringiem',
    new_market: 'Plan: szybka walidacja nowego segmentu kampaniami testowymi + analityka kohortowa',
    product_launch: 'Plan: budowa świadomości produktu + ścieżka konwersji z mocnym pomiarem incrementality',
    brand_awareness: 'Plan: zasięgowy mix Meta + YouTube + display z systematycznym brand liftem',
  };

  const plan: string[] = [];

  // Always-on: fix critical tracking
  const critical = gaps.filter((g) => g.severity === 'critical');
  if (critical.length) {
    plan.push(
      `Tydzień 1–2: domknięcie krytycznych luk w trackingu (${critical.map((g) => g.title).join(', ')}). To warunek wszystkiego dalej.`,
    );
  }

  if (budget === 'lt_10k') {
    plan.push(
      'Budżet do 10k: skupcie się na 1 platformie (Google Ads — search z najmocniejszą intencją). Meta jako wsparcie remarketingowe za 10–15% budżetu.',
    );
  } else if (budget === '10k_30k') {
    plan.push(
      'Budżet 10–30k: mix Google Ads (search + PMax) i Meta (prospecting + retargeting) w proporcjach 60/40. Dorzucamy creative testing co 2 tyg.',
    );
  } else if (budget === '30k_50k') {
    plan.push(
      'Budżet 30–50k: dochodzi LinkedIn Ads (B2B) lub YouTube (B2C/brand). Wprowadzamy server-side tracking i CAPI dla Meta.',
    );
  } else if (budget === 'gt_50k') {
    plan.push(
      'Budżet >50k: pełny portfolio approach (Google + Meta + LinkedIn/TikTok/YouTube), MMM lub incrementality testing, dedykowany analityk.',
    );
  }

  if (goal === 'lead_gen' && !s.hasLeadMagnet) {
    plan.push('Lead magnet w 4 tygodnie: jeden raport/kalkulator branżowy + landing + sekwencja 5 maili.');
  }
  if (goal === 'sales_growth' && off(s.metaPixel)) {
    plan.push('Włączenie Meta Pixel + CAPI: odzyskanie remarketingu (zwykle +15–25% ROAS w 60 dni).');
  }
  if (goal === 'brand_awareness') {
    plan.push('Definicja brand lift KPI (awareness, recall, consideration) i pomiar co kwartał — bez tego budżet brandowy jest niemierzony.');
  }

  if (m === 'gut_feel' || m === 'basic_ga') {
    plan.push('Dashboard KPI w Looker Studio (channel × campaign × week) w 2 tygodnie — fundament do decyzji opartych o dane.');
  }
  if (m === 'kpi_dashboards') {
    plan.push('Przejście na atrybucję data-driven (GA4 DDA + raporty kohortowe LTV) — następny poziom dojrzałości.');
  }

  const rationale = `Plan jest dopasowany do Waszego celu (${GOAL_LABELS[goal]}), budżetu (${BUDGET_LABELS[budget]}) i obecnej dojrzałości pomiaru (${MEASUREMENT_LABELS[m]}). Bierze pod uwagę realne luki wykryte przez skan: ${gaps.slice(0, 3).map((g) => g.title.toLowerCase()).join(', ') || 'brak krytycznych luk'}.`;

  const estimatedImpact =
    budget === 'lt_10k'
      ? 'Przy domknięciu trackingu i konsolidacji budżetu spodziewamy się 20–40% poprawy efektywności w 90 dni.'
      : budget === '10k_30k'
      ? '30–50% poprawy CPL/ROAS w 90 dni przy realizacji planu.'
      : 'Realnie 25–45% poprawy efektywności + uruchomienie nowych kanałów testowo w ramach budżetu.';

  return { headline: headlines[goal], rationale, plan, estimatedImpact };
}

async function polishWithClaude(base: Report): Promise<Report> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = `Jesteś senior strategiem performance marketingu w agencji Novem.pl. Otrzymujesz wstępny raport audytu marketingowego dla klienta. Twoje zadanie: doprecyzować pole "business" (industry, icp, stage) i przepisać "rationale" + "headline" rekomendacji w jeszcze bardziej konkretny, bezpośredni sposób — bez ogólników, w stylu Novem (profesjonalny, ROI-driven, pewny). Zwróć WYŁĄCZNIE JSON z polami: { "business": {...}, "recommendation": { "headline": "...", "rationale": "..." } }. Brak komentarzy. Język: polski.

DANE WEJŚCIOWE:
${JSON.stringify(
    {
      form: base.form,
      scrape: {
        domain: base.scrape.domain,
        title: base.scrape.title,
        h1: base.scrape.h1,
        metaDescription: base.scrape.metaDescription,
        techStack: base.scrape.techStack,
        socialLinks: base.scrape.socialLinks,
      },
      ads: base.ads,
      currentBusiness: base.business,
      currentRecommendation: base.recommendation,
    },
    null,
    2,
  )}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = msg.content
    .filter((c) => c.type === 'text')
    .map((c: any) => c.text)
    .join('');
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return base;
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...base,
      business: { ...base.business, ...(parsed.business || {}) },
      recommendation: { ...base.recommendation, ...(parsed.recommendation || {}) },
    };
  } catch {
    return base;
  }
}
