import { NextRequest, NextResponse } from 'next/server';
import { scrapeSite } from '@/lib/scrapers/site';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const cache = new Map<string, { at: number; data: any }>();
const TTL_MS = 5 * 60 * 1000;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const url = String(body?.url || '').trim();
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });
  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json(cached.data);
  }
  const data = await scrapeSite(url);
  cache.set(url, { at: Date.now(), data });
  return NextResponse.json(data);
}
