'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelMatrix, PixelDial, PixelWave } from './PixelArt';

interface Step { key: string; label: string; done: boolean }

const AGENT_META: Record<string, { agent: string; tagline: string; module: string }> = {
  scrape_site: { agent: 'site-scanner', tagline: 'parsing dom + tracking pixels', module: 'scraper.site' },
  scrape_ads: { agent: 'google-ads-scout', tagline: 'fetching ads transparency', module: 'scraper.gads' },
  scrape_meta: { agent: 'meta-scout', tagline: 'fetching meta ad library', module: 'scraper.meta' },
  competitors: { agent: 'competitor-mapper', tagline: 'identifying 3-5 rivals', module: 'analyzer.comp' },
  synthesize: { agent: 'strategy-synth', tagline: 'claude sonnet 4.6', module: 'llm.synth' },
};

const LOG_LINES: { delay: number; text: string; kind: 'ok' | 'info' | 'warn' | 'cmd' }[] = [
  { delay: 100, text: '$ ./run_audit.sh', kind: 'cmd' },
  { delay: 250, text: 'spawning 5 agents...', kind: 'info' },
  { delay: 500, text: 'GET / → 200 OK', kind: 'ok' },
  { delay: 800, text: 'parsing <head> ... title, meta, og:*', kind: 'info' },
  { delay: 1200, text: 'detect: gtm   → ✓', kind: 'ok' },
  { delay: 1500, text: 'detect: ga4   → searching gtag(...)...', kind: 'info' },
  { delay: 1900, text: 'detect: meta_pixel → connect.facebook.net', kind: 'info' },
  { delay: 2300, text: 'detect: linkedin_insight → snap.licdn.com', kind: 'info' },
  { delay: 2700, text: 'apify::actor[automation-lab/google-ads-scraper]', kind: 'cmd' },
  { delay: 3100, text: 'apify::run → started · region=PL', kind: 'info' },
  { delay: 3800, text: '12 google ads found · format=text', kind: 'ok' },
  { delay: 4400, text: 'meta_ad_library → 0 active campaigns', kind: 'warn' },
  { delay: 5000, text: 'tech_stack: wordpress + woocommerce', kind: 'info' },
  { delay: 5600, text: 'competitors → ranked 4 candidates', kind: 'ok' },
  { delay: 6300, text: 'computing maturity scores [6 axes]', kind: 'info' },
  { delay: 7100, text: 'llm::claude-sonnet-4.6 → polishing report', kind: 'cmd' },
  { delay: 8000, text: 'generating recommendation matrix...', kind: 'info' },
  { delay: 8800, text: 'finalizing report...', kind: 'info' },
];

const kindClass = (k: string) => {
  if (k === 'ok') return 'text-novem-ok';
  if (k === 'warn') return 'text-novem-warn';
  if (k === 'cmd') return 'text-novem-accent';
  return 'text-novem-ink';
};

export function Loader({ steps }: { steps: Step[] }) {
  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / Math.max(1, steps.length)) * 100);
  const currentIdx = steps.findIndex((s) => !s.done);
  const current = currentIdx === -1 ? steps[steps.length - 1] : steps[currentIdx];

  return (
    <section className="min-h-[85vh] py-12 bg-novem-paper relative overflow-hidden">
      {/* background auras — peach/honey + violet + mint + lime */}
      <div className="aura aura-honey aura-drift" style={{ width: 600, height: 600, top: -100, left: '30%' }} />
      <div className="aura aura-violet aura-drift" style={{ width: 500, height: 500, top: '40%', right: -150, animationDelay: '5s' }} />
      <div className="aura aura-mint aura-drift" style={{ width: 420, height: 420, bottom: 0, left: -100, animationDelay: '10s' }} />
      <div className="aura aura-lime" style={{ width: 380, height: 380, top: '20%', left: -120, opacity: 0.35 }} />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="section-label mb-3">analiza_w_toku</div>
          <h1 className="display-mono text-4xl lg:text-6xl text-novem-ink leading-[0.95] text-balance">
            ANALIZA <span className="marker-lime">W TOKU</span>
          </h1>
          <p className="text-novem-dim mt-3 font-mono text-sm">
            Pięć agentów pracuje równolegle. Nie zamykaj zakładki — ~60-90 sekund.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT: big LED progress card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-7 space-y-4"
          >
            {/* Main progress card */}
            <div
              className="glass-soft p-8 relative overflow-hidden"
              style={{ boxShadow: '0 30px 80px -20px rgba(212,255,0,.45), 0 12px 28px -12px rgba(15,15,18,.12)' }}
            >
              <div className="aura aura-lime absolute" style={{ width: 320, height: 320, top: -80, right: -80, opacity: 0.5 }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="section-label">postęp</div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-novem-dim flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-novem-ok animate-pulse" />
                    trwa analiza
                  </span>
                </div>

                {/* Giant LED matrix inside a soft gradient inner panel */}
                <div className="rounded-3xl bg-gradient-to-br from-novem-aurora/15 via-white to-novem-aquaGlow/20 p-7 mb-5 border border-novem-ink/5 overflow-hidden">
                  <PixelMatrix pct={pct} cols={26} rows={4} cell={12} gap={3} />
                </div>

                {/* counter + dial */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-1">ogółem</div>
                    <div className="display-mono text-7xl text-novem-ink tabular-nums leading-[1]">
                      {String(pct).padStart(2, '0')}<span className="text-novem-mute">%</span>
                    </div>
                    {current && (
                      <div className="font-mono text-xs text-novem-dim mt-2">
                        teraz: <span className="text-novem-ink font-bold">{AGENT_META[current.key]?.agent}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <div className="aura aura-mint absolute" style={{ width: 220, height: 220, top: -50, right: -50, opacity: 0.6 }} />
                    <div className="relative">
                      <PixelDial value={pct} size={130} cellArc={6} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agents grid (soft floating cards) */}
            <div
              className="glass-soft p-5"
              style={{ boxShadow: '0 30px 80px -20px rgba(163,149,255,.35), 0 12px 28px -12px rgba(15,15,18,.1)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="section-label">agenci_ai</div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-novem-dim">
                  [{steps.length}]
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {steps.map((s, i) => {
                  const meta = AGENT_META[s.key];
                  if (!meta) return null;
                  const isCurrent = !s.done && steps.slice(0, i).every((p) => p.done);
                  return (
                    <motion.div
                      key={s.key}
                      layout
                      className={`p-4 rounded-2xl transition-all border ${
                        s.done
                          ? 'bg-white border-novem-ok/30'
                          : isCurrent
                          ? 'bg-novem-lime/30 border-novem-ink/20'
                          : 'bg-white/60 border-novem-ink/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] uppercase tracking-widest text-novem-dim">
                          {meta.module}
                        </span>
                        <StatusBadge done={s.done} active={isCurrent} />
                      </div>
                      <div className="font-mono text-sm font-bold text-novem-ink">{meta.agent}</div>
                      <div className="font-mono text-[10px] text-novem-dim mt-1">// {meta.tagline}</div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* RIGHT: terminal log */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-5"
          >
            <LiveFeed running={pct < 100} />
          </motion.div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-novem-dim">
          <span>🔒 szyfrowane · zgodne z RODO · novem.pl</span>
          <span>napędzane: <span className="text-novem-ink font-bold">apify</span> + <span className="text-novem-ink font-bold">claude</span></span>
        </div>
      </div>
    </section>
  );
}

function StatusBadge({ done, active }: { done: boolean; active: boolean }) {
  if (done) return <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-novem-ok text-white">GOTOWE</span>;
  if (active) return <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-novem-ink text-novem-lime">PRACA<span className="cursor-blink !text-novem-lime" /></span>;
  return <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-white text-novem-dim border border-novem-ink/15">KOLEJKA</span>;
}

function LiveFeed({ running }: { running: boolean }) {
  const [visible, setVisible] = useState<typeof LOG_LINES>([]);
  const ref = useRef<HTMLDivElement>(null);
  const startedAt = useRef<number>(Date.now());

  useEffect(() => {
    if (!running) return;
    const timers: NodeJS.Timeout[] = [];
    LOG_LINES.forEach((line) => {
      const t = setTimeout(() => {
        setVisible((v) => [...v, { ...line, delay: Date.now() - startedAt.current }]);
        requestAnimationFrame(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; });
      }, line.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [running]);

  return (
    <div
      className="glass-soft h-full overflow-hidden"
      style={{ boxShadow: '0 30px 80px -20px rgba(255,158,229,.4), 0 12px 28px -12px rgba(15,15,18,.1)' }}
    >
      <div className="px-5 py-3.5 border-b border-novem-ink/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PixelWave width={14} height={5} cell={3} />
          <span className="font-mono text-[11px] uppercase tracking-widest text-novem-ink font-bold">
            agent.log
          </span>
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-novem-ok">
          <span className="w-1.5 h-1.5 rounded-full bg-novem-ok animate-pulse" />
          LIVE
        </span>
      </div>
      <div
        ref={ref}
        className="h-[560px] overflow-y-auto px-5 py-4 font-mono text-[12px] leading-[1.7] bg-white/40"
        style={{ scrollbarWidth: 'thin' }}
      >
        <AnimatePresence initial={false}>
          {visible.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-3"
            >
              <span className="text-novem-mute select-none flex-shrink-0">
                [{String(Math.floor(line.delay / 1000)).padStart(2, '0')}.{String(line.delay % 1000).padStart(3, '0').slice(0, 2)}]
              </span>
              <span className={kindClass(line.kind)}>
                {line.kind === 'cmd' && <span className="text-novem-ink font-bold">$ </span>}
                {line.text.replace(/^\$ /, '')}
              </span>
            </motion.div>
          ))}
          {running && (
            <div className="flex gap-3 mt-1">
              <span className="text-novem-mute select-none">[..]</span>
              <span className="text-novem-dim cursor-blink">processing</span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
