'use client';
import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Report as ReportType, Finding } from '@/lib/types';
import { GOAL_LABELS, BUDGET_LABELS, MEASUREMENT_LABELS } from '@/lib/types';
import { RadarChart } from './RadarChart';
import { PixelGlobe, PixelPadlock, PixelDial, PixelNLogo } from './PixelArt';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export function Report({ report }: { report: ReportType }) {
  return (
    <div className="relative">
      {/* Page-wide auras — honey/peach/violet/mint, NO hot pink */}
      <div className="aura aura-honey aura-drift" style={{ width: 600, height: 600, top: '5%', right: -150, opacity: 0.4 }} />
      <div className="aura aura-mint aura-drift" style={{ width: 500, height: 500, top: '35%', left: -180, opacity: 0.4, animationDelay: '4s' }} />
      <div className="aura aura-violet aura-drift" style={{ width: 600, height: 600, bottom: '10%', right: -150, opacity: 0.35, animationDelay: '8s' }} />
      <div className="aura aura-lime aura-drift" style={{ width: 380, height: 380, bottom: '30%', left: -100, opacity: 0.25, animationDelay: '6s' }} />

      <div className="relative max-w-5xl mx-auto px-6 py-12 space-y-20">
        <Header report={report} />
        <SectionDNA report={report} />
        <SectionAds report={report} />
        <SectionAudit report={report} />
        <SectionRecommendation report={report} />
        <SectionCTA report={report} />
      </div>
    </div>
  );
}

function Header({ report }: { report: ReportType }) {
  const date = new Date(report.createdAt);
  return (
    <motion.header initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-8 border-b border-novem-ink/10">
      <div className="flex items-center justify-between mb-6 font-mono text-[10px] uppercase tracking-widest text-novem-dim">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-novem-ok rounded-full" />
          raport · gotowy
        </span>
        <span>{date.toISOString().replace('T', ' · ').slice(0, 19)}</span>
      </div>
      <div className="section-label mb-4">raport_audytu</div>
      <h1 className="display-mono text-4xl lg:text-6xl text-novem-ink leading-[0.95] mb-6">
        AUDYT DLA<br />
        <span className="marker-lime">{report.scrape.domain.toUpperCase()}</span>
      </h1>
      <div className="font-mono text-sm text-novem-dim mb-4">
        <span className="text-novem-ink font-bold">{'>'}</span> przygotowane dla:{' '}
        <span className="text-novem-ink font-bold">{report.form.name}</span>
        <span className="text-novem-mute"> &lt;{report.form.email}&gt;</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip>cel = {GOAL_LABELS[report.form.goal as keyof typeof GOAL_LABELS]}</Chip>
        <Chip>budget = {BUDGET_LABELS[report.form.budget as keyof typeof BUDGET_LABELS]}</Chip>
        <Chip>pomiar = {MEASUREMENT_LABELS[report.form.measurement as keyof typeof MEASUREMENT_LABELS]}</Chip>
      </div>
    </motion.header>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="chip">{children}</span>;
}

function SectionDNA({ report }: { report: ReportType }) {
  const dnaItems = [
    { label: 'branża', value: report.business.industry },
    { label: 'model biznesu', value: report.business.model },
    { label: 'zasięg', value: report.business.geo },
    { label: 'etap rozwoju', value: report.business.stage },
    { label: 'icp · klient docelowy', value: report.business.icp, full: true },
  ];
  return (
    <SectionWrapper>
      <SectionHeader num="01" title="DNA BIZNESU" subtitle="jak_was_widzimy" />
      <div
        className="grid lg:grid-cols-12 gap-4 lg:gap-6"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="lg:col-span-8 grid sm:grid-cols-2 gap-3"
        >
          {dnaItems.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`glass-soft p-5 ${item.full ? 'sm:col-span-2' : ''}`}
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-novem-ink mb-1.5 font-bold">
                # {item.label}
              </div>
              <div className="text-novem-ink text-sm leading-snug">{item.value}</div>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={{ once: true }}
          className="lg:col-span-4 glass-soft p-8 flex flex-col items-center justify-center bg-gradient-to-br from-novem-lime/20 via-white to-novem-violetGlow/15"
          style={{ boxShadow: '0 30px 80px -20px rgba(212,255,0,.45), 0 12px 28px -12px rgba(15,15,18,.1)' }}
        >
          <PixelNLogo cell={8} />
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mt-4 text-center">
novem · pieczęć zaufania
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

function SectionAds({ report }: { report: ReportType }) {
  const ads = report.ads;
  const meta = (ads as any).googleAdsMeta as
    | { formats?: Record<string, number>; first?: string; last?: string }
    | undefined;

  if (!ads.googleAdsActive && !ads.metaAdsActive) {
    return (
      <SectionWrapper>
        <SectionHeader num="02" title="WASZE REKLAMY" subtitle="co_znalezlismy" />
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={{ once: true, margin: '-100px' }}
          className="glass-soft p-8 bg-gradient-to-br from-novem-warn/15 via-white to-novem-peach/15"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-warn mb-2 font-bold">// warning</div>
          <div className="display-mono text-2xl text-novem-ink mb-2">BRAK AKTYWNYCH KAMPANII</div>
          <div className="text-sm text-novem-dim leading-relaxed">
            Nie widzimy aktywnych reklam dla <span className="text-novem-ink font-bold">{report.scrape.domain}</span>
            {' '}ani w Google Ads Transparency, ani w Meta Ad Library.
          </div>
        </motion.div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <SectionHeader num="02" title="PUBLIC ADS" subtitle="what_we_found" />

      {/* Stats + globe */}
      <div className="grid lg:grid-cols-12 gap-4 mb-6">
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={{ once: true }}
          className="lg:col-span-7 grid grid-cols-2 gap-3"
        >
          <BigStat label="google ads" value={ads.googleAdsCount} accent />
          <BigStat label="meta ads" value={ads.metaAdsCount} />
          {meta?.first && meta?.last && (
            <div className="col-span-2 glass-soft p-5">
              <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-2"># okres_aktywnosci</div>
              <div className="flex items-center justify-between font-mono text-sm text-novem-ink">
                <span>{meta.first}</span>
                <span className="pixel-bar text-novem-ink/40 flex-1 mx-4 text-center">{'░'.repeat(36)}</span>
                <span>{meta.last}</span>
              </div>
            </div>
          )}
        </motion.div>
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 glass-soft p-8 flex items-center justify-center bg-gradient-to-br from-novem-peach/25 via-white to-novem-violetGlow/15"
          style={{ boxShadow: '0 30px 80px -20px rgba(255,199,172,.55), 0 12px 28px -12px rgba(15,15,18,.1)' }}
        >
          <PixelGlobe cell={10} />
        </motion.div>
      </div>

      {meta?.formats && Object.keys(meta.formats).length > 0 && (
        <div className="glass-soft p-5 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-ink mb-3 font-bold">
            # formaty_kreacji
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(meta.formats).map(([fmt, count]) => (
              <span key={fmt} className="font-mono text-xs px-3 py-1.5 rounded-full bg-novem-ink text-novem-paper">
                <span>{fmt.toLowerCase()}</span>
                <span className="text-novem-lime"> = </span>
                <span className="tabular-nums">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {ads.sampleAds.length > 0 && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-ink mb-3 font-bold">
            # przykładowe_kreacje
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {ads.sampleAds.map((ad, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="glass-soft p-4 flex gap-3"
              >
                {ad.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ad.image}
                    alt="creative"
                    className="w-14 h-14 object-cover rounded-xl flex-shrink-0"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-novem-peach/40 to-novem-lime/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-novem-ink text-lg">▣</span>
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-novem-ink mb-0.5 font-bold">
                    {ad.platform}
                  </div>
                  <div className="font-mono text-[11px] text-novem-ink leading-snug">{ad.text || '—'}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </SectionWrapper>
  );
}

function BigStat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 800);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return (
    <div
      ref={ref}
      className={`p-5 rounded-card ${accent ? 'bg-novem-lime border border-novem-ink/10' : 'glass-soft'}`}
      style={accent ? { boxShadow: '0 30px 80px -20px rgba(212,255,0,.55), 0 8px 24px -12px rgba(15,15,18,.1)' } : undefined}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-2">// {label}</div>
      <div className="display-mono text-5xl tabular-nums leading-[1] text-novem-ink">
        {String(n).padStart(2, '0')}
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mt-2">aktywnych</div>
    </div>
  );
}

function SectionAudit({ report }: { report: ReportType }) {
  const avgScore =
    Math.round(
      ((report.radar.tracking + report.radar.paidAcquisition + report.radar.organicPresence + report.radar.conversion + report.radar.retention + report.radar.measurement) /
        6) *
        10,
    ) / 10;
  return (
    <SectionWrapper>
      <SectionHeader num="03" title="AUDYT DOJRZAŁOŚCI" subtitle="radar_6_wymiarow" />

      {/* Radar + dial */}
      <div className="grid lg:grid-cols-12 gap-4 mb-6">
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={{ once: true }}
          className="lg:col-span-7 glass-soft p-5"
        >
          <RadarChart scores={report.radar} />
        </motion.div>
        <motion.div
          initial={fadeUp.hidden}
          whileInView={fadeUp.visible}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 glass-soft p-7 flex flex-col items-center justify-center bg-gradient-to-br from-novem-aquaGlow/25 via-white to-novem-lime/15"
          style={{ boxShadow: '0 30px 80px -20px rgba(168,240,229,.55), 0 12px 28px -12px rgba(15,15,18,.1)' }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-3">// ogolna_dojrzalosc</div>
          <PixelDial value={Math.round((avgScore / 10) * 100)} size={160} cellArc={7} />
          <div className="font-mono text-xs text-novem-dim mt-3">{avgScore.toFixed(1)} / 10 średnia</div>
        </motion.div>
      </div>

      {/* Score cells */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6"
      >
        <ScoreCell label="tracking" value={report.radar.tracking} />
        <ScoreCell label="paid" value={report.radar.paidAcquisition} />
        <ScoreCell label="organiczna" value={report.radar.organicPresence} />
        <ScoreCell label="konwersja" value={report.radar.conversion} />
        <ScoreCell label="retencja" value={report.radar.retention} />
        <ScoreCell label="pomiar" value={report.radar.measurement} />
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-ok mb-3 font-bold">
            # mocne_strony · {report.strengths.length}
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="space-y-2"
          >
            {report.strengths.length === 0 && (
              <div className="glass-soft p-4 text-sm text-novem-dim font-mono">// brak — to też sygnał</div>
            )}
            {report.strengths.map((f, i) => (
              <motion.div key={i} variants={fadeUp}><FindingCard finding={f} /></motion.div>
            ))}
          </motion.div>
        </div>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-err mb-3 font-bold">
            # luki · {report.gaps.length}
          </div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="space-y-2"
          >
            {report.gaps.map((f, i) => (
              <motion.div key={i} variants={fadeUp}><FindingCard finding={f} /></motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}

function ScoreCell({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 1000);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(value * eased * 10) / 10);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  const filled = Math.round(value);
  const isGood = value >= 7;
  const isWarn = value >= 4 && value < 7;
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className={`p-4 rounded-2xl ${isGood ? 'bg-novem-lime/40' : 'glass-soft'}`}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-1"># {label}</div>
      <div className="display-mono text-2xl tabular-nums leading-tight text-novem-ink">
        {n.toFixed(1)}<span className="text-novem-mute text-base">/10</span>
      </div>
      <div className="pixel-bar text-xs mt-2">
        <span className={isGood ? 'text-novem-ok' : isWarn ? 'text-novem-warn' : 'text-novem-err'}>
          {'█'.repeat(filled)}
        </span>
        <span className="text-novem-ink/15">{'░'.repeat(10 - filled)}</span>
      </div>
    </motion.div>
  );
}

function SectionRecommendation({ report }: { report: ReportType }) {
  return (
    <SectionWrapper>
      <SectionHeader num="04" title="REKOMENDACJA" subtitle="plan_na_90_dni" />
      <motion.div
        initial={fadeUp.hidden}
        whileInView={fadeUp.visible}
        viewport={{ once: true, margin: '-100px' }}
        className="glass-soft p-0 overflow-hidden"
        style={{ boxShadow: '0 30px 80px -20px rgba(212,255,0,.5), 0 12px 28px -12px rgba(15,15,18,.12)' }}
      >
        <div className="bg-novem-lime p-7 border-b border-novem-ink/10">
          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-ink mb-2 font-bold">
            # plan · dopasowany
          </div>
          <h3 className="display-mono text-2xl lg:text-3xl text-novem-ink leading-tight">
            {report.recommendation.headline}
          </h3>
        </div>
        <div className="p-7">
          <p className="text-sm text-novem-ink mb-8 leading-relaxed">
            {report.recommendation.rationale}
          </p>

          <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-3 font-bold">
            # kroki_realizacji
          </div>
          <ol className="space-y-2 mb-8">
            {report.recommendation.plan.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-novem-ink/5"
              >
                <span className="font-mono text-novem-ink font-bold flex-shrink-0 chip !text-[10px] !py-1">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-novem-ink leading-relaxed">{step}</span>
              </motion.li>
            ))}
          </ol>

          <div className="rounded-2xl p-5 bg-gradient-to-br from-novem-aquaGlow/30 via-white to-novem-lime/20 border border-novem-ink/5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-novem-ink mb-2 font-bold">
              # szacowany_wplyw
            </div>
            <div className="text-novem-ink leading-relaxed">{report.recommendation.estimatedImpact}</div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}

function SectionCTA({ report }: { report: ReportType }) {
  return (
    <SectionWrapper>
      <SectionHeader num="05" title="KOLEJNY KROK" subtitle="umow_30_min" />
      <motion.div
        initial={fadeUp.hidden}
        whileInView={fadeUp.visible}
        viewport={{ once: true, margin: '-100px' }}
        className="relative glass-soft p-8 lg:p-12 overflow-hidden"
        style={{ boxShadow: '0 30px 80px -20px rgba(255,199,172,.55), 0 12px 28px -12px rgba(15,15,18,.12)' }}
      >
        <div className="aura aura-peach absolute" style={{ width: 400, height: 400, top: -100, right: -100, opacity: 0.6 }} />
        <div className="aura aura-lime absolute" style={{ width: 380, height: 380, bottom: -100, left: -100, opacity: 0.5 }} />

        <div className="relative grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-novem-ink mb-3 font-bold">
              # konsultacja · 30 min · bezpłatna
            </div>
            <h3 className="display-mono text-3xl lg:text-4xl text-novem-ink mb-4 leading-[1] text-balance">
              {report.cta.headline}
            </h3>
            <p className="text-sm text-novem-dim mb-8 leading-relaxed">
              Senior strateg Novem przejdzie z Wami przez raport, doprecyzuje rekomendacje
              pod Wasz kontekst i pokaże case studies z podobnych branż. Bez zobowiązań.
            </p>
            <a href={report.cta.calLink} target="_blank" rel="noopener" className="btn-accent !py-4 !px-8 !text-sm">
              umów konsultację →
            </a>
            <div className="hr-dotted my-8" />
            <div className="font-mono text-xs text-novem-dim flex flex-wrap gap-x-6 gap-y-1">
              <span><span className="w-1.5 h-1.5 bg-novem-ok rounded-full inline-block mr-2" />kontakt@novem.pl</span>
              <span><span className="w-1.5 h-1.5 bg-novem-ok rounded-full inline-block mr-2" />+48 — — — — — —</span>
              <span><span className="w-1.5 h-1.5 bg-novem-ok rounded-full inline-block mr-2" />novem.pl</span>
            </div>
          </div>
          <div className="lg:col-span-4 flex justify-center">
            <div className="float-y">
              <PixelPadlock cell={9} />
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}

function SectionWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.section>
  );
}

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  return (
    <div className="mb-8 flex items-center gap-6 pb-4 border-b border-novem-ink/10">
      <span className="display-mono text-6xl text-novem-ink tabular-nums leading-none">
        <span className="marker-lime">{num}</span>
      </span>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-1">// {subtitle}</div>
        <h2 className="display-mono text-2xl lg:text-3xl text-novem-ink leading-none">{title}</h2>
      </div>
    </div>
  );
}

function FindingCard({ finding }: { finding: Finding }) {
  const accent =
    finding.severity === 'critical'
      ? { label: 'CRIT', bg: 'bg-novem-err text-white', halo: 'rgba(220,38,38,.18)' }
      : finding.severity === 'warning'
      ? { label: 'WARN', bg: 'bg-novem-warn text-white', halo: 'rgba(217,119,6,.18)' }
      : { label: 'INFO', bg: 'bg-novem-lime text-novem-ink', halo: 'rgba(212,255,0,.4)' };
  return (
    <div
      className="glass-soft p-4 transition-all hover:-translate-y-0.5"
      style={{ boxShadow: `0 20px 50px -20px ${accent.halo}, 0 4px 12px -6px rgba(15,15,18,.08)` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${accent.bg} font-bold`}>
          {accent.label}
        </span>
      </div>
      <div className="font-mono font-bold text-sm text-novem-ink mb-1">{finding.title}</div>
      <div className="text-sm text-novem-dim leading-relaxed">{finding.detail}</div>
      {finding.impact && (
        <div className="mt-3 pt-3 border-t border-novem-ink/8 text-xs text-novem-ink font-mono leading-relaxed">
          <span className="font-bold">→</span> {finding.impact}
        </div>
      )}
    </div>
  );
}
