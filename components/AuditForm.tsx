'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LeadForm, Goal, Budget, Measurement,
  GOAL_LABELS, BUDGET_LABELS, MEASUREMENT_LABELS,
} from '@/lib/types';

const initial: LeadForm = {
  url: '', goal: '', budget: '', measurement: '', name: '', email: '', consent: false,
};

const normalizeUrl = (raw: string) => {
  const t = raw.trim();
  if (!t) return '';
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
};
const isValidUrl = (raw: string) => {
  try {
    const u = new URL(normalizeUrl(raw));
    return !!u.hostname && u.hostname.includes('.');
  } catch { return false; }
};

export function AuditForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1);
  const [form, setForm] = useState<LeadForm>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  const preTrigger = async (url: string) => {
    try {
      await fetch('/api/scrape', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalizeUrl(url), warmup: true }),
      });
    } catch {}
  };

  const next = () => {
    setError(null);
    if (step === 1) {
      if (!isValidUrl(form.url)) { setError('Podaj poprawny URL, np. novem.pl'); return; }
      preTrigger(form.url); setDirection(1); setStep(2);
    } else if (step === 2) {
      if (!form.goal || !form.budget || !form.measurement) {
        setError('Wybierz odpowiedź w każdej sekcji.'); return;
      }
      setDirection(1); setStep(3);
    }
  };
  const back = () => { setDirection(-1); setStep((s) => (s - 1) as 1 | 2 | 3); };

  const submit = async () => {
    setError(null);
    if (!form.name.trim() || !form.email.trim()) { setError('Imię i email są wymagane.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) { setError('Email wygląda na nieprawidłowy.'); return; }
    if (!form.consent) { setError('Potrzebujemy Twojej zgody na wysyłkę raportu.'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('/api/lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, url: normalizeUrl(form.url) }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { id: string };
      router.push(`/report/${data.id}?status=processing`);
    } catch {
      setError('Coś poszło nie tak. Spróbuj ponownie.'); setSubmitting(false);
    }
  };

  return (
    <section id="audyt" className="py-24 bg-novem-paper relative overflow-hidden">
      <div className="aura aura-honey" style={{ width: 500, height: 500, top: '10%', right: -100, opacity: 0.4 }} />
      <div className="aura aura-mint" style={{ width: 400, height: 400, bottom: -100, left: -80, opacity: 0.4 }} />

      <div className="relative max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="section-label mb-4">rozpocznij_audyt</div>
          <h2 className="display-mono text-4xl lg:text-5xl text-novem-ink leading-[0.95]">
            KROK <span className="marker-lime">{String(step).padStart(2, '0')}</span>
            <span className="text-novem-mute"> / 03</span>
          </h2>
        </motion.div>

        {/* Progress bar */}
        <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-2 flex justify-between">
          <span>{step === 1 ? 'twoja strona' : step === 2 ? 'twój kontekst' : 'twoje dane'}</span>
          <span>{Math.round(((step - 1) / 2) * 100)}%</span>
        </div>
        <div className="flex gap-1.5 mb-10">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`h-2 flex-1 rounded-full transition-colors ${
                n < step ? 'bg-novem-ink' : n === step ? 'bg-novem-lime shadow-glowLime' : 'bg-novem-ink/10'
              }`}
            />
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step < 3) next();
            else submit();
          }}
          className="glass-soft p-7 lg:p-9 relative"
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 30 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 && <Step1 form={form} update={update} />}
              {step === 2 && <Step2 form={form} update={update} />}
              {step === 3 && <Step3 form={form} update={update} />}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 p-4 rounded-2xl bg-novem-err/8 text-novem-err font-mono text-xs border border-novem-err/20"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 1 ? (
              <button type="button" onClick={back} className="btn-ghost">← wstecz</button>
            ) : <span />}
            {step < 3 ? (
              <button type="submit" className="btn-accent">dalej →</button>
            ) : (
              <button type="submit" disabled={submitting} className="btn-accent">
                {submitting ? 'uruchamiam...' : 'wygeneruj raport →'}
              </button>
            )}
          </div>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-widest text-novem-dim">
          <span className="w-1.5 h-1.5 bg-novem-ok rounded-full" />
          szyfrowane · zgodne z RODO · bez odsprzedaży
        </div>
      </div>
    </section>
  );
}

function Step1({ form, update }: { form: LeadForm; update: <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => void }) {
  const filled = form.url.trim().length > 0;
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-novem-dim mb-2"># 01 · strona</div>
      <label className="block text-novem-ink text-2xl lg:text-3xl font-extrabold mb-1 leading-tight">
        Wpisz adres Waszej strony
      </label>
      <p className="text-novem-dim text-sm mb-6">
        Wstępna analiza ruszy automatycznie w tle — wystarczy adres domeny.
      </p>

      {/* HERO input — large, glowing */}
      <div className="relative">
        {/* lime aura behind the input */}
        <div
          className="aura aura-lime pointer-events-none"
          style={{
            width: '100%',
            height: 180,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: filled ? 0.85 : 0.6,
            filter: 'blur(60px)',
          }}
        />
        <div
          className="relative flex items-center bg-white rounded-3xl border-2 border-novem-ink transition-all"
          style={{
            boxShadow: filled
              ? '0 25px 60px -15px rgba(212,255,0,.8), 0 8px 24px -8px rgba(15,15,18,.18)'
              : '0 20px 50px -15px rgba(212,255,0,.55), 0 6px 18px -8px rgba(15,15,18,.12)',
          }}
        >
          <span className="pl-6 pr-2 font-mono text-novem-ink/40 text-2xl lg:text-3xl font-bold select-none">
            https://
          </span>
          <input
            type="text"
            inputMode="url"
            placeholder="twoja-strona.pl"
            value={form.url}
            onChange={(e) => update('url', e.target.value)}
            className="flex-1 py-6 lg:py-7 pr-6 bg-transparent border-0 outline-none text-novem-ink text-2xl lg:text-3xl font-mono font-bold placeholder:text-novem-mute/60 placeholder:font-normal"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
          {filled && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mr-4 w-3 h-3 rounded-full bg-novem-ok shadow-glowLime"
            />
          )}
        </div>
      </div>

      {/* Helper line */}
      <div className="mt-3 flex items-center gap-2 font-mono text-[11px] text-novem-dim">
        <span className="w-1 h-1 rounded-full bg-novem-lime" />
        <span>wystarczy sama domena — np. <span className="text-novem-ink font-bold">novem.pl</span></span>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-7 p-5 rounded-2xl bg-gradient-to-br from-novem-aurora/15 via-white to-novem-lime/10 border border-novem-ink/5"
      >
        <div className="font-mono text-[10px] uppercase tracking-widest text-novem-dim mb-3">
          // co sprawdzimy
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-xs text-novem-ink">
          {['google tag manager', 'ga4 / universal', 'meta pixel + capi', 'linkedin insight', 'hotjar / clarity', 'cookie consent', 'aktywne google ads', 'aktywne meta ads']
            .map((x) => (
              <div key={x} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-novem-lime rounded-full" /> {x}
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}

function Step2({ form, update }: { form: LeadForm; update: <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => void }) {
  return (
    <div className="space-y-8">
      <RadioGroup hash="02 · cel" title="Jaki jest Wasz cel biznesowy na 12 miesięcy?"
        name="goal" value={form.goal}
        options={Object.entries(GOAL_LABELS) as [Goal, string][]}
        onChange={(v) => update('goal', v)} />
      <RadioGroup hash="03 · budżet" title="Jaki budżet miesięczny na zakup mediów?"
        name="budget" value={form.budget}
        options={Object.entries(BUDGET_LABELS) as [Budget, string][]}
        onChange={(v) => update('budget', v)} />
      <RadioGroup hash="04 · pomiar" title="Jak mierzycie skuteczność dziś?"
        name="measurement" value={form.measurement}
        options={Object.entries(MEASUREMENT_LABELS) as [Measurement, string][]}
        onChange={(v) => update('measurement', v)} />
    </div>
  );
}

function Step3({ form, update }: { form: LeadForm; update: <K extends keyof LeadForm>(k: K, v: LeadForm[K]) => void }) {
  return (
    <motion.div
      initial="hidden" animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      className="space-y-5"
    >
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <div className="font-mono text-[11px] uppercase tracking-widest text-novem-dim mb-1"># 05 · imię</div>
        <label className="block text-novem-ink font-semibold text-sm mb-2">Imię</label>
        <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
          className="input" placeholder="Jan" autoFocus />
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        <div className="font-mono text-[11px] uppercase tracking-widest text-novem-dim mb-1"># 06 · email</div>
        <label className="block text-novem-ink font-semibold text-sm mb-2">Email służbowy</label>
        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
          className="input" placeholder="jan@firma.pl" />
      </motion.div>
      <motion.label
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
        className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-novem-aquaGlow/15 via-white to-novem-lime/10 border border-novem-ink/5 cursor-pointer hover:from-novem-lime/20 transition"
      >
        <input type="checkbox" checked={form.consent}
          onChange={(e) => update('consent', e.target.checked)}
          className="mt-1 w-4 h-4 accent-novem-ink" />
        <span className="font-mono text-xs text-novem-dim leading-relaxed">
          Wyrażam zgodę na otrzymanie raportu na podany e-mail oraz kontakt ze strony Novem
          w sprawie analizy. Zgodę mogę wycofać w każdej chwili.
        </span>
      </motion.label>
    </motion.div>
  );
}

function RadioGroup<T extends string>({
  hash, title, name, value, options, onChange,
}: {
  hash: string; title: string; name: string; value: T | '';
  options: [T, string][]; onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-novem-dim mb-1"># {hash}</div>
      <div className="text-novem-ink text-sm font-semibold mb-3">{title}</div>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map(([val, label]) => {
          const active = value === val;
          return (
            <motion.label
              key={val}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer transition-all font-mono text-xs ${
                active
                  ? 'bg-novem-lime text-novem-ink border border-novem-ink shadow-glowLime'
                  : 'bg-white text-novem-ink border border-novem-ink/8 hover:border-novem-ink/30 hover:shadow-card'
              }`}
            >
              <input type="radio" name={name} checked={active} onChange={() => onChange(val)} className="sr-only" />
              <div className={`w-4 h-4 rounded-full border-2 border-novem-ink flex items-center justify-center flex-shrink-0 ${
                active ? 'bg-novem-ink' : 'bg-white'
              }`}>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-novem-lime" />}
              </div>
              <span>{label}</span>
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}
