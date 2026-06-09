'use client';
import { motion } from 'framer-motion';

const logos = [
  { name: 'PLAY', weight: 'font-black' },
  { name: 'TAURON', weight: 'font-black' },
  { name: 'WAWEL', weight: 'font-black' },
  { name: 'MORELE.NET', weight: 'font-black' },
  { name: 'STEGU', weight: 'font-black' },
  { name: 'ENEA', weight: 'font-black' },
  { name: 'LOTTO', weight: 'font-black' },
  { name: 'WSEI', weight: 'font-black' },
];

const badges = [
  { label: 'Google Premier Partner', icon: '◆' },
  { label: 'Meta Business Partner', icon: '◆' },
  { label: '15 lat doświadczenia', icon: '★' },
];

export function SocialProof() {
  return (
    <section className="py-16 lg:py-20 bg-novem-paper relative overflow-hidden">
      {/* warm subtle backdrop */}
      <div className="aura aura-honey" style={{ width: 700, height: 220, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.25 }} />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="section-label mb-3">zaufali_nam</div>
          <h2 className="display-mono text-2xl lg:text-3xl text-novem-ink leading-tight">
            450+ MAREK · <span className="marker-lime">25 TYSIĘCY</span> KAMPANII
          </h2>
        </motion.div>

        {/* Logos grid — boxy, prominent */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10"
        >
          {logos.map((logo) => (
            <motion.div
              key={logo.name}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              className="aspect-[3/1.6] flex items-center justify-center bg-white border border-novem-ink/10 rounded-2xl px-3 hover:border-novem-ink/30 hover:shadow-soft transition-all"
            >
              <span className={`${logo.weight} text-novem-ink tracking-tight text-sm lg:text-base text-center leading-none`}>
                {logo.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Badges row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-2"
        >
          {badges.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-novem-ink text-novem-paper font-mono text-[11px] uppercase tracking-wider"
            >
              <span className="text-novem-lime">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
