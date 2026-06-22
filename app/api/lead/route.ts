import { NextRequest, NextResponse } from 'next/server';
import { scrapeSite } from '@/lib/scrapers/site';
import { scrapeAds } from '@/lib/scrapers/ads';
import { synthesize } from '@/lib/synthesize';
import { pushToGetResponse, persistReport, notifySlack } from '@/lib/integrations';
import { store, newId, DEFAULT_STEPS } from '@/lib/store';
import type { LeadForm } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Run the scrape inside the live invocation (serverless freezes work that runs
// after the response is returned). Netlify kills functions at ~10s by default.
export const maxDuration = 60;

function valid(f: any): f is LeadForm {
  return (
    f && typeof f.url === 'string' && typeof f.email === 'string' && typeof f.name === 'string'
  );
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as LeadForm | null;
  if (!valid(body)) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  const id = newId();
  store.set(id, {
    id,
    form: body,
    status: 'scraping',
    steps: DEFAULT_STEPS.map((s) => ({ ...s })),
  });

  // Run the pipeline to completion before responding. Fire-and-forget does not
  // survive on serverless — work after the response is suspended. The client polls
  // GET ?id= for the result, so an error is surfaced via the stored status.
  // [DIAG] tymczasowe — usunąć po diagnozie.
  console.log(`[lead:POST] id=${id} url=${body.url} → running pipeline at=${new Date().toISOString()}`);
  try {
    await runPipeline(id, body);
  } catch (e) {
    const p = store.get(id);
    if (p) {
      p.status = 'error';
      p.error = String((e as Error)?.message || e);
      store.set(id, p);
    }
  }

  // [DIAG]
  console.log(`[lead:POST] id=${id} → returning response at=${new Date().toISOString()}`);
  return NextResponse.json({ id });
}

async function runPipeline(id: string, form: LeadForm) {
  // [DIAG] tymczasowe — usunąć po diagnozie
  console.log(`[lead:pipeline] id=${id} START at=${new Date().toISOString()}`);
  const markDone = (key: string) => {
    const p = store.get(id);
    if (!p) return;
    p.steps = p.steps.map((s) => (s.key === key ? { ...s, done: true } : s));
    store.set(id, p);
  };

  const domain = new URL(form.url).hostname.replace(/^www\./, '');

  const [scrape, ads] = await Promise.all([
    scrapeSite(form.url).finally(() => markDone('scrape_site')),
    scrapeAds(domain).finally(() => {
      markDone('scrape_ads');
      markDone('scrape_meta');
    }),
  ]);

  markDone('competitors'); // placeholder until competitor agent is wired

  const p = store.get(id);
  if (p) {
    p.scrape = scrape;
    p.ads = ads;
    p.status = 'analyzing';
    store.set(id, p);
  }

  const report = await synthesize({ id, form, scrape, ads });
  markDone('synthesize');

  const final = store.get(id);
  if (final) {
    final.report = report;
    final.status = 'ready';
    store.set(id, final);
  }

  // Fan-out to integrations (all no-op without keys)
  await Promise.all([
    pushToGetResponse(form, id),
    persistReport(report),
    notifySlack(form, id),
  ]);
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const p = store.get(id);
  if (!p) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({
    id: p.id,
    status: p.status,
    steps: p.steps,
    error: p.error,
    report: p.report,
  });
}
