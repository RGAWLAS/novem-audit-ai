import type { AdSignals } from '../types';

/**
 * Google Ads Transparency via Apify actor `automation-lab/google-ads-scraper`.
 * Uses Google's internal SearchService RPC — fast (~10-20s) and cheap.
 *
 * When the integration is not configured or the call fails we return an honest
 * `unknown` state — we never fabricate ad counts (the old placeholder did, which
 * made "no campaigns" indistinguishable from "we couldn't check").
 */
const ACTOR = 'automation-lab~google-ads-scraper';

export async function scrapeAds(domain: string): Promise<AdSignals> {
  const token = process.env.APIFY_TOKEN;
  if (!token || token.startsWith('PASTE_')) {
    return unknownAds();
  }

  try {
    const url = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${token}&timeout=60`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domains: [domain],
        region: 'PL',
        maxAds: 30,
      }),
      // Apify run-sync can take up to 60s. Give Next.js fetch enough time.
      signal: AbortSignal.timeout(75_000),
    });
    if (!res.ok) {
      console.warn('[ads] Apify HTTP', res.status, await res.text().catch(() => ''));
      return unknownAds();
    }
    const items: ApifyAd[] = await res.json();
    return shape(items);
  } catch (e) {
    console.warn('[ads] Apify error', e);
    return unknownAds();
  }
}

interface ApifyAd {
  advertiserId?: string;
  advertiserName?: string;
  creativeId?: string;
  adFormat?: 'Text' | 'Image' | 'Video';
  firstShown?: string;
  lastShown?: string;
  previewUrl?: string | null;
  imageUrl?: string | null;
  region?: string;
}

function shape(items: ApifyAd[]): AdSignals {
  const total = items.length;
  // Distinct creatives across formats
  const formats = items.reduce<Record<string, number>>((acc, a) => {
    const k = a.adFormat || 'Other';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  // Activity window from firstShown/lastShown
  const dates = items.flatMap((a) => [a.firstShown, a.lastShown].filter(Boolean) as string[]);
  const first = dates.sort()[0];
  const last = dates.sort()[dates.length - 1];

  const sampleAds = items.slice(0, 6).map((a) => ({
    platform: 'google' as const,
    text: a.advertiserName
      ? `${a.advertiserName} · ${a.adFormat || 'Ad'} (${a.firstShown || '?'} → ${a.lastShown || '?'})`
      : undefined,
    image: a.imageUrl || a.previewUrl || undefined,
  }));

  return {
    // We successfully queried Transparency: confirmed if any ad, otherwise a
    // trustworthy not_detected.
    google: total > 0 ? 'confirmed' : 'not_detected',
    googleAdsCount: total,
    meta: 'unknown', // separate Meta Ad Library integration is TODO — never claimed as "none"
    metaAdsCount: 0,
    sampleAds,
    googleAdsMeta: { formats, first, last },
  };
}

function unknownAds(): AdSignals {
  return {
    google: 'unknown',
    googleAdsCount: 0,
    meta: 'unknown',
    metaAdsCount: 0,
    sampleAds: [],
  };
}
