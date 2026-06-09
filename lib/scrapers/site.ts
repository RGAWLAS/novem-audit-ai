import * as cheerio from 'cheerio';
import type { ScrapeSignals } from '../types';

const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; NovemAuditBot/1.0; +https://novem.pl/audyt)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: ctrl.signal,
      redirect: 'follow',
    });
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

export async function scrapeSite(rawUrl: string): Promise<ScrapeSignals> {
  const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const domain = new URL(url).hostname.replace(/^www\./, '');

  let html = '';
  try {
    html = await fetchWithTimeout(url);
  } catch {
    return emptySignals(url, domain);
  }

  const $ = cheerio.load(html);
  const lowerHtml = html.toLowerCase();

  const has = (needle: string) => lowerHtml.includes(needle.toLowerCase());

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
    title: $('title').first().text().trim() || undefined,
    h1: $('h1').first().text().trim() || undefined,
    metaDescription: $('meta[name="description"]').attr('content') || undefined,
    language: $('html').attr('lang') || undefined,
    hasGTM: has('googletagmanager.com/gtm.js') || has('gtm-'),
    hasGA4: has('gtag(') || has('googletagmanager.com/gtag') || /G-[A-Z0-9]{6,}/.test(html),
    hasMetaPixel: has('connect.facebook.net') || has('fbq('),
    hasLinkedInInsight: has('snap.licdn.com'),
    hasHotjar: has('static.hotjar.com'),
    hasClarity: has('clarity.ms'),
    hasCookieBanner:
      has('cookiebot') || has('cookie-consent') || has('cookielaw') || has('cookieyes') || has('didomi'),
    socialLinks: Array.from(new Set(socialLinks)).slice(0, 10),
    ctas: Array.from(new Set(ctas)).slice(0, 10),
    hasBlog: $('a[href*="/blog" i], a[href*="/aktualnosci" i]').length > 0,
    hasContactForm: $('form').length > 0,
    hasLeadMagnet: /ebook|pobierz|whitepaper|raport|checklist|webinar/i.test(html),
    techStack: detectTechStack(html),
  };
}

function emptySignals(url: string, domain: string): ScrapeSignals {
  return {
    url,
    domain,
    hasGTM: false,
    hasGA4: false,
    hasMetaPixel: false,
    hasLinkedInInsight: false,
    hasHotjar: false,
    hasClarity: false,
    hasCookieBanner: false,
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
