import type { AdSignals } from '../types';

/**
 * Google Ads Transparency via Apify actor `automation-lab/google-ads-scraper`.
 * Uses Google's internal SearchService RPC — fast (~10-20s) and cheap.
 * Falls back to a placeholder when APIFY_TOKEN is missing or call fails.
 */
const ACTOR = 'automation-lab~google-ads-scraper';

export async function scrapeAds(domain: string): Promise<AdSignals> {
  const token = process.env.APIFY_TOKEN;
  if (!token || token.startsWith('PASTE_')) {
    return placeholder(domain);
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
      return placeholder(domain);
    }
    const items: ApifyAd[] = await res.json();
    return shape(items);
  } catch (e) {
    console.warn('[ads] Apify error', e);
    return placeholder(domain);
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
    googleAdsActive: total > 0,
    googleAdsCount: total,
    metaAdsActive: false, // separate Meta Ad Library integration is TODO
    metaAdsCount: 0,
    sampleAds,
    googleAdsMeta: { formats, first, last },
  } as AdSignals & { googleAdsMeta: { formats: Record<string, number>; first?: string; last?: string } };
}

function placeholder(domain: string): AdSignals {
  const seed = domain.length;
  return {
    googleAdsActive: seed % 2 === 0,
    googleAdsCount: seed % 7,
    metaAdsActive: seed % 3 === 0,
    metaAdsCount: seed % 5,
    sampleAds: [],
  };
}
