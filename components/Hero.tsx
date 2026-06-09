'use client';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PixelGlobe, PixelBars, PixelDial } from './PixelArt';

function Counter({ to, suffix = '', duration = 1.5 }: { to: number; suffix?: string; duration?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);
  return <span className="tabular-nums">{n.toLocaleString('pl-PL')}{suffix}</span>;
}

export function Hero() {
  return (
    <section className="relative bg-novem-paper text-novem-ink overflow-hidden">
      {/* Background auras — warm (peach/honey) + violet + mint, NO pink */}
      <div className="aura aura-honey aura-drift" style={{ width: 520, height: 520, top: -120, left: '38%' }} />
      <div className="aura aura-violet aura-drift" style={{ width: 480, height: 480, top: 120, right: -120, animationDelay: '5s' }} />
      <div className="aura aura-lime aura-drift" style={{ width: 380, height: 380, bottom: -120, left: -60, animationDelay: '10s', opacity: 0.4 }} />
      <div className="aura aura-mint aura-drift" style={{ width: 320, height: 320, top: '40%', left: '8%', animationDelay: '7s', opacity: 0.5 }} />

      <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-12 gap-12 items-center">
        {/* LEFT: copy */}
        <div className="lg:col-span-7 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="section-label mb-8"
          >
            darmowy_audyt · ~90&nbsp;sekund
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="display-mono text-5xl lg:text-7xl leading-[0.95] mb-8 text-balance"
          >
            ZNAJDŹ <br />
            <span className="marker-lime">DZIURY</span><br />
            W&nbsp;BUDŻECIE.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base lg:text-lg text-novem-dim mb-10 max-w-xl leading-relaxed"
          >
            Skanujemy Wasz tracking, kampanie w Google Ads Transparency, Meta Ad Library
            i konkurencję. Dostajecie raport z konkretnymi liczbami — gdzie tracicie
            pieniądze i co zrobić w 90 dni.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 mb-12"
          >
            <a href="#audyt" className="btn-accent">Uruchom audyt &nbsp;→</a>
            <a href="#jak-to-dziala" className="btn-ghost">Zobacz jak to działa</a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs text-novem-dim"
          >
            <span>
              <span className="display-mono text-2xl text-novem-ink"><Counter to={450} suffix="+" /></span>{' '}
              <span className="block text-[10px] uppercase tracking-widest">klientów</span>
            </span>
            <span className="w-px h-8 bg-novem-ink/10" />
            <span>
              <span className="display-mono text-2xl text-novem-ink"><Counter to={25} suffix="K+" /></span>{' '}
              <span className="block text-[10px] uppercase tracking-widest">kampanii</span>
            </span>
            <span className="w-px h-8 bg-novem-ink/10" />
            <span>
              <span className="display-mono text-2xl text-novem-ink"><Counter to={15} /></span>{' '}
              <span className="block text-[10px] uppercase tracking-widest">lat na rynku</span>
            </span>
          </motion.div>
        </div>

        {/* RIGHT: asymmetric floating cards composition */}
        <div className="lg:col-span-5 relative h-[480px] hidden lg:block">
          {/* Card 1 — Big pixel display (centerpiece) — peach glow now */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="absolute top-8 right-0 w-72 glass-soft p-6 float-y"
            style={{ boxShadow: '0 30px 80px -20px rgba(255,199,172,.55), 0 12px 28px -12px rgba(15,15,18,.15)' }}
          >
            <div className="section-label mb-3">kampanie_paid</div>
            <div className="bg-gradient-to-br from-novem-peach/30 via-white to-novem-violetGlow/20 rounded-2xl p-5 flex items-center justify-center mb-3 relative overflow-hidden">
              <div className="aura aura-peach absolute" style={{ width: 200, height: 200, top: -40, left: -40, opacity: 0.4 }} />
              <div className="relative">
                <PixelGlobe cell={8} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white py-2 border border-novem-ink/5">
                <div className="font-mono text-[9px] uppercase tracking-widest text-novem-dim">aktywne</div>
                <div className="font-mono font-bold text-novem-ink">12</div>
              </div>
              <div className="rounded-xl bg-novem-lime py-2">
                <div className="font-mono text-[9px] uppercase tracking-widest text-novem-ink/70">formaty</div>
                <div className="font-mono font-bold text-novem-ink">3</div>
              </div>
              <div className="rounded-xl bg-white py-2 border border-novem-ink/5">
                <div className="font-mono text-[9px] uppercase tracking-widest text-novem-dim">region</div>
                <div className="font-mono font-bold text-novem-ink">PL</div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 — Floating dial (mint) */}
          <motion.div
            initial={{ opacity: 0, y: -20, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 4 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="absolute top-0 left-0 w-52 glass-soft p-5 float-y-slow"
            style={{ boxShadow: '0 30px 80px -20px rgba(168,240,229,.6), 0 12px 28px -12px rgba(15,15,18,.12)' }}
          >
            <div className="section-label mb-2">dojrzałość</div>
            <div className="bg-gradient-to-br from-novem-aquaGlow/30 via-white to-novem-lime/20 rounded-2xl p-4 flex items-center justify-center mb-2">
              <PixelDial value={72} size={110} cellArc={6} />
            </div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim text-center">ogółem</div>
          </motion.div>

          {/* Card 3 — Bars chart (violet) */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="absolute bottom-0 left-8 w-64 glass-soft p-5 float-y-delayed"
            style={{ boxShadow: '0 30px 80px -20px rgba(163,149,255,.55), 0 12px 28px -12px rgba(15,15,18,.12)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="section-label">historia_paid</div>
              <span className="chip !py-0.5 !px-2 !text-[9px] bg-novem-lime">+ 24%</span>
            </div>
            <div className="bg-gradient-to-br from-novem-violetGlow/20 via-white to-novem-aquaGlow/15 rounded-2xl p-4 flex items-end justify-center">
              <PixelBars values={[3, 6, 4, 9, 7, 11, 8, 12]} cell={7} />
            </div>
          </motion.div>

          {/* Floating mini chip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="absolute top-44 -left-4 chip !bg-novem-ink !text-novem-paper !border-novem-ink shadow-soft"
          >
            <span className="w-1.5 h-1.5 bg-novem-lime rounded-full mr-2 animate-pulse" />
            12 reklam znalezionych
          </motion.div>
        </div>
      </div>

      {/* Bottom marquee on dark bar */}
      <div className="relative bg-novem-ink text-novem-paper overflow-hidden">
        <div className="flex items-center gap-8 py-3 px-6 font-mono text-[10px] uppercase tracking-[0.25em] whitespace-nowrap animate-marquee">
          {Array(2).fill(0).map((_, k) => (
            <span key={k} className="flex items-center gap-8">
              <span><span className="text-novem-lime">●</span> google ads transparency</span>
              <span>·</span>
              <span><span className="text-novem-lime">●</span> meta ad library</span>
              <span>·</span>
              <span><span className="text-novem-lime">●</span> ga4 · gtm · pixel · linkedin · clarity</span>
              <span>·</span>
              <span><span className="text-novem-lime">●</span> claude sonnet 4.6</span>
              <span>·</span>
              <span><span className="text-novem-lime">●</span> apify scrapers</span>
              <span>·</span>
              <span><span className="text-novem-lime">●</span> radar dojrzałości 6-osi</span>
              <span>·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
