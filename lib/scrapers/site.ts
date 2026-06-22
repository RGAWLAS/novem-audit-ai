import * as cheerio from 'cheerio';
import type { ScrapeSignals, SignalState } from '../types';

const TIMEOUT_MS = 8000;
const GTM_TIMEOUT_MS = 6000;

const UA = 'Mozilla/5.0 (compatible; NovemAuditBot/1.0; +https://novem.pl/audyt)';

type FetchResult =
  | { ok: true; body: string }
  | { ok: false; error: string };

async function fetchText(url: string, timeoutMs: number, accept: string): Promise<FetchResult> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  const startedAt = Date.now();
  // [DIAG] tymczasowe logowanie — usunąć po diagnozie
  console.log(`[scrape:fetch] → start url=${url} timeoutMs=${timeoutMs} ua="${UA}" at=${new Date().toISOString()}`);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: accept },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    const elapsed = Date.now() - startedAt;
    // [DIAG]
    console.log(
      `[scrape:fetch] ← response url=${url} status=${res.status} ok=${res.ok} type="${res.headers.get('content-type') || ''}" elapsedMs=${elapsed}`,
    );
    // Honest fetch: a 4xx/5xx body is an error page, not the site. Never parse it.
    if (!res.ok) {
      // [DIAG] podejrzyj treść strony błędu (np. blokada Cloudflare / captcha) — nie zmienia wyniku
      const snippet = await res.text().catch(() => '');
      console.warn(
        `[scrape:fetch] !ok url=${url} status=${res.status} bodySnippet="${snippet.slice(0, 200).replace(/\s+/g, ' ')}"`,
      );
      return { ok: false, error: `HTTP ${res.status}` };
    }
    return { ok: true, body: await res.text() };
  } catch (e) {
    const elapsed = Date.now() - startedAt;
    const err = e as any;
    // [DIAG] kluczowe: undici opakowuje prawdziwy powód w `cause` (ENOTFOUND, ECONNREFUSED,
    // ENETUNREACH, UND_ERR_CONNECT_TIMEOUT...). Obecny kod gubi to, zwracając samo "fetch failed".
    console.error(
      `[scrape:fetch] ✗ url=${url} elapsedMs=${elapsed} name=${err?.name} message=${err?.message} cause=${
        err?.cause ? err.cause.code || err.cause.message || String(err.cause) : 'none'
      } aborted=${ctrl.signal.aborted}`,
    );
    const reason = e instanceof Error && e.name === 'AbortError' ? 'timeout' : String((e as Error)?.message || e);
    return { ok: false, error: reason };
  } finally {
    clearTimeout(t);
  }
}

/**
 * Resolve a tracking signal across three evidence sources:
 *  1. inline   — found directly in the page HTML
 *  2. container — found inside the parsed GTM container (Droga 1)
 *  3. otherwise — depends on whether we could see everything
 *
 * `gtm` describes the GTM situation so we know whether a negative is trustworthy:
 *  - 'none'     → no GTM on the page, so the HTML is the whole story → not_detected
 *  - 'parsed'   → GTM present and we read the container → not_detected
 *  - 'opaque'   → GTM present but container unreadable → unknown (it might live inside)
 */
function resolveSignal(
  inline: boolean,
  inContainer: boolean,
  gtm: 'none' | 'parsed' | 'opaque',
): SignalState {
  if (inline || inContainer) return 'confirmed';
  if (gtm === 'opaque') return 'unknown';
  return 'not_detected';
}

interface ContainerHits {
  ga4: boolean;
  metaPixel: boolean;
  linkedInInsight: boolean;
  hotjar: boolean;
  clarity: boolean;
  cookieBanner: boolean;
}

function scanForTracking(text: string): ContainerHits {
  const l = text.toLowerCase();
  const has = (n: string) => l.includes(n);
  return {
    ga4: has('gtag(') || has('googletagmanager.com/gtag') || /g-[a-z0-9]{6,}/i.test(text) ||
      // GA4 tag template aliases inside a GTM container
      has('"gaawc"') || has('"gaawe"') || has('googtag'),
    metaPixel: has('connect.facebook.net') || has('fbq(') || has('facebook-pixel') || /fbevents\.js/.test(l),
    linkedInInsight: has('snap.licdn.com') || has('_linkedin_partner_id'),
    hotjar: has('static.hotjar.com') || has('hotjar'),
    clarity: has('clarity.ms'),
    cookieBanner:
      has('cookiebot') || has('cookie-consent') || has('cookielaw') || has('cookieyes') || has('didomi'),
  };
}

/** Droga 1: pull the GTM container JS and look inside it for the tags it deploys. */
async function parseGtmContainer(gtmId: string): Promise<ContainerHits | null> {
  const res = await fetchText(
    `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`,
    GTM_TIMEOUT_MS,
    'application/javascript,text/javascript,*/*',
  );
  if (!res.ok) return null;
  return scanForTracking(res.body);
}

export async function scrapeSite(rawUrl: string): Promise<ScrapeSignals> {
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const domain = new URL(url).hostname.replace(/^www\./, '');

  // [DIAG] tymczasowe — usunąć po diagnozie
  console.log(`[scrape:site] → scrapeSite url=${url} domain=${domain} at=${new Date().toISOString()}`);

  const page = await fetchText(url, TIMEOUT_MS, 'text/html,application/xhtml+xml');
  if (!page.ok) {
    // [DIAG]
    console.warn(`[scrape:site] ✗ unreachable url=${url} reason="${page.error}"`);
    // We genuinely could not see the site → everything is `unknown`, nothing is fabricated.
    return unknownSignals(url, domain, page.error);
  }

  const html = page.body;
  const $ = cheerio.load(html);
  const lowerHtml = html.toLowerCase();
  const has = (needle: string) => lowerHtml.includes(needle.toLowerCase());

  // --- GTM detection (inline) + container fetch (Droga 1) ---
  const gtmIdMatch = html.match(/GTM-[A-Z0-9]+/i);
  const hasGtmInline = has('googletagmanager.com/gtm.js') || !!gtmIdMatch;

  let gtmMode: 'none' | 'parsed' | 'opaque' = 'none';
  let container: ContainerHits | null = null;
  if (hasGtmInline && gtmIdMatch) {
    container = await parseGtmContainer(gtmIdMatch[0].toUpperCase());
    gtmMode = container ? 'parsed' : 'opaque';
  }
  const c = container ?? emptyHits();

  // --- inline detections from the page HTML ---
  const inline = scanForTracking(html);

  const gtm: SignalState = hasGtmInline ? 'confirmed' : 'not_detected';

  const socialLinks: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (/facebook\.com|instagram\.com|linkedin\.com|youtube\.com|tiktok\.com|x\.com|twitter\.com/.test(href)) {
      socialLinks.push(href);
    }
  });

  const ctas: string[] = [];
  $('a, button').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 40 && /kontakt|wypróbuj|kup|zamów|umów|pobierz|sprawdź|zacznij|rozpocznij|skontaktuj|porozmawiajmy|umów się|zarejestruj/i.test(text)) {
      ctas.push(text);
    }
  });

  return {
    url,
    domain,
    reachable: true,
    gtmContainerChecked: gtmMode === 'parsed',
    title: $('title').first().text().trim() || undefined,
    h1: $('h1').first().text().trim() || undefined,
    metaDescription: $('meta[name="description"]').attr('content') || undefined,
    language: $('html').attr('lang') || undefined,
    gtm,
    ga4: resolveSignal(inline.ga4, c.ga4, gtmMode),
    metaPixel: resolveSignal(inline.metaPixel, c.metaPixel, gtmMode),
    linkedInInsight: resolveSignal(inline.linkedInInsight, c.linkedInInsight, gtmMode),
    hotjar: resolveSignal(inline.hotjar, c.hotjar, gtmMode),
    clarity: resolveSignal(inline.clarity, c.clarity, gtmMode),
    cookieBanner: resolveSignal(inline.cookieBanner, c.cookieBanner, gtmMode),
    socialLinks: Array.from(new Set(socialLinks)).slice(0, 10),
    ctas: Array.from(new Set(ctas)).slice(0, 10),
    hasBlog: $('a[href*="/blog" i], a[href*="/aktualnosci" i]').length > 0,
    hasContactForm: $('form').length > 0,
    hasLeadMagnet: /ebook|pobierz|whitepaper|raport|checklist|webinar/i.test(html),
    techStack: detectTechStack(html),
  };
}

function emptyHits(): ContainerHits {
  return {
    ga4: false,
    metaPixel: false,
    linkedInInsight: false,
    hotjar: false,
    clarity: false,
    cookieBanner: false,
  };
}

function unknownSignals(url: string, domain: string, fetchError: string): ScrapeSignals {
  return {
    url,
    domain,
    reachable: false,
    fetchError,
    gtmContainerChecked: false,
    gtm: 'unknown',
    ga4: 'unknown',
    metaPixel: 'unknown',
    linkedInInsight: 'unknown',
    hotjar: 'unknown',
    clarity: 'unknown',
    cookieBanner: 'unknown',
    socialLinks: [],
    ctas: [],
    hasBlog: false,
    hasContactForm: false,
    hasLeadMagnet: false,
    techStack: [],
  };
}

function detectTechStack(html: string): string[] {
  const stack: string[] = [];
  const l = html.toLowerCase();
  if (l.includes('shopify')) stack.push('Shopify');
  if (l.includes('woocommerce')) stack.push('WooCommerce');
  if (l.includes('wp-content')) stack.push('WordPress');
  if (l.includes('webflow')) stack.push('Webflow');
  if (l.includes('next.js') || l.includes('_next/static')) stack.push('Next.js');
  if (l.includes('prestashop')) stack.push('PrestaShop');
  if (l.includes('idosell')) stack.push('IdoSell');
  if (l.includes('shoper')) stack.push('Shoper');
  return stack;
}
