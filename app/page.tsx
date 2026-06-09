import { Nav } from '@/components/Nav';
import { Hero } from '@/components/Hero';
import { SocialProof } from '@/components/SocialProof';
import { HowItWorks } from '@/components/HowItWorks';
import { AuditForm } from '@/components/AuditForm';

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <SocialProof />
      <HowItWorks />
      <AuditForm />
      <footer className="py-10 bg-novem-ink text-novem-paper border-t border-novem-ink">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-widest">
          <div>© {new Date().getFullYear()} novem · all rights reserved</div>
          <div className="flex gap-6">
            <a href="https://novem.pl" className="hover:text-novem-lime transition-colors">novem.pl</a>
            <a href="mailto:kontakt@novem.pl" className="hover:text-novem-lime transition-colors">kontakt</a>
            <span className="opacity-60">v.0.1.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
