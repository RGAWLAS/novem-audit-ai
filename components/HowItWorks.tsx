'use client';
import { motion } from 'framer-motion';
import { PixelScanner, PixelBars, PixelPadlock } from './PixelArt';

const steps = [
  {
    num: '01',
    title: 'CONNECT',
    cmd: 'scan → site + tracking',
    desc: 'Podajesz URL. AI sprawdza GA4, GTM, Meta Pixel, LinkedIn Insight, Hotjar/Clarity, cookie banner, CTA i lead magnety.',
    bullets: ['piksele trackingu (5+)', 'cta + lead magnet', 'tech stack strony'],
    art: <PixelScanner cell={8} />,
    auraClass: 'aura-mint',
    glow: '0 30px 80px -20px rgba(168,240,229,.55), 0 12px 28px -12px rgba(15,15,18,.12)',
    panel: 'from-novem-aquaGlow/30 via-white to-novem-aurora/15',
  },
  {
    num: '02',
    title: 'MONITOR',
    cmd: 'fetch → ads + competitors',
    desc: 'Pobieramy aktywne kampanie z Google Ads Transparency, Meta Ad Library oraz mapujemy 3–5 najbliższych konkurentów.',
    bullets: ['google ads transparency', 'meta ad library', 'mapa konkurencji (3-5)'],
    art: <PixelBars values={[3, 7, 11, 5, 9, 4, 12, 6]} cell={9} />,
    auraClass: 'aura-violet',
    glow: '0 30px 80px -20px rgba(163,149,255,.55), 0 12px 28px -12px rgba(15,15,18,.12)',
    panel: 'from-novem-violetGlow/25 via-white to-novem-aquaGlow/20',
  },
  {
    num: '03',
    title: 'DEPLOY',
    cmd: 'synth → plan + 90d',
    desc: 'Raport z wykresem dojrzałości w 6 wymiarach, lukami, mocnymi stronami i planem na 90 dni — dopasowany do Waszego budżetu i celu.',
    bullets: ['radar dojrzałości 6 osi', 'plan na 90 dni', 'konsultacja 30 min'],
    art: <PixelPadlock cell={8} />,
    auraClass: 'aura-peach',
    glow: '0 30px 80px -20px rgba(255,199,172,.55), 0 12px 28px -12px rgba(15,15,18,.12)',
    panel: 'from-novem-peach/30 via-white to-novem-violetGlow/15',
  },
];

export function HowItWorks() {
  return (
    <section id="jak-to-dziala" className="py-24 bg-novem-paper relative overflow-hidden">
      <div className="aura aura-lime" style={{ width: 600, height: 600, top: '20%', right: -200, opacity: 0.25 }} />
      <div className="aura aura-violet" style={{ width: 500, height: 500, bottom: -100, left: -100, opacity: 0.3 }} />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <div className="section-label mb-4">jak_to_dziala</div>
          <h2 className="display-mono text-4xl lg:text-6xl text-novem-ink leading-[0.95] mb-4 text-balance">
            OD ZERA DO RAPORTU<br />
            <span className="marker-lime">W 90 SEKUND</span>
          </h2>
          <div className="font-mono text-novem-dim text-sm mt-4 max-w-xl mx-auto">
            Trzy procesy uruchamiane równolegle. Zero rozmowy. Zero pdfa do pobrania.
          </div>
        </motion.div>

        <div className="space-y-8 lg:space-y-14">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`relative grid lg:grid-cols-12 gap-6 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
            >
              {/* Soft underlay aura per step */}
              <div className={`aura ${s.auraClass}`} style={{ width: 400, height: 400, top: '50%', left: i % 2 === 0 ? '60%' : '10%', transform: 'translateY(-50%)', opacity: 0.5 }} />

              {/* Step number floating chip */}
              <div className={`lg:col-span-1 relative z-10 ${i % 2 === 1 ? 'lg:order-3 text-right' : ''}`}>
                <div className="inline-block">
                  <div className="chip !text-[10px] mb-2">krok</div>
                  <div className="display-mono text-7xl lg:text-8xl text-novem-ink leading-[0.85] tracking-tighter">
                    {s.num}
                  </div>
                  <div className="mt-2 w-12 h-1 rounded-full bg-novem-lime" />
                </div>
              </div>

              {/* Content card */}
              <div className={`lg:col-span-6 relative z-10 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="glass-soft p-8" style={{ boxShadow: s.glow }}>
                  <div className="font-mono text-xs text-novem-dim mb-2">$ {s.cmd}</div>
                  <h3 className="display-mono text-3xl lg:text-4xl text-novem-ink mb-3 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-novem-dim leading-relaxed mb-5">{s.desc}</p>
                  <ul className="space-y-1.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 font-mono text-xs text-novem-ink">
                        <span className="w-1.5 h-1.5 bg-novem-lime rounded-full" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pixel-art floating panel */}
              <div className={`lg:col-span-5 relative z-10 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div
                  className={`glass-soft p-8 flex items-center justify-center min-h-[260px] bg-gradient-to-br ${s.panel}`}
                  style={{ boxShadow: s.glow }}
                >
                  <div className="pulse-soft">{s.art}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
