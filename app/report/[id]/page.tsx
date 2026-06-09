'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Nav } from '@/components/Nav';
import { Loader } from '@/components/Loader';
import { Report } from '@/components/Report';
import type { Report as ReportType } from '@/lib/types';

interface Status {
  id: string;
  status: 'pending' | 'scraping' | 'analyzing' | 'ready' | 'error';
  steps: { key: string; label: string; done: boolean }[];
  error?: string;
  report?: ReportType;
}

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [data, setData] = useState<Status | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/lead?id=${id}`, { cache: 'no-store' });
        if (!res.ok) return;
        const json = (await res.json()) as Status;
        if (!cancelled) setData(json);
        if (json.status === 'ready' || json.status === 'error') return;
        setTimeout(tick, 1500);
      } catch {
        if (!cancelled) setTimeout(tick, 3000);
      }
    };
    tick();
    return () => { cancelled = true; };
  }, [id]);

  if (!data) {
    return (
      <main>
        <Nav />
        <Loader steps={[{ key: 'scrape_site', label: 'init', done: false }]} />
      </main>
    );
  }

  if (data.status === 'error') {
    return (
      <main>
        <Nav />
        <div className="max-w-xl mx-auto px-6 py-20">
          <div className="glass-soft p-8" style={{ boxShadow: '0 30px 80px -20px rgba(220,38,38,.3)' }}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-novem-err mb-3 font-bold">
              // error
            </div>
            <h1 className="display-mono text-2xl text-novem-ink mb-2">EXECUTION FAILED</h1>
            <p className="font-mono text-sm text-novem-dim mb-6">{data.error || 'unknown error'}</p>
            <a href="/" className="btn-accent">retry()</a>
          </div>
        </div>
      </main>
    );
  }

  if (data.status === 'ready' && data.report) {
    return (
      <main>
        <Nav />
        <Report report={data.report} />
      </main>
    );
  }

  return (
    <main>
      <Nav />
      <Loader steps={data.steps} />
    </main>
  );
}
