export function Nav() {
  return (
    <nav className="sticky top-0 z-40 bg-novem-paper/70 backdrop-blur-md border-b border-novem-ink/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-novem-lime rounded-full shadow-glowLime" />
          <span className="text-xl font-extrabold text-novem-ink tracking-tight lowercase">novem</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-novem-dim hidden sm:inline">
            /&nbsp;audit&nbsp;ai
          </span>
        </a>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-novem-dim">
            <span className="w-1.5 h-1.5 rounded-full bg-novem-ok animate-pulse" />
            system online
          </span>
          <a href="#audyt" className="btn-accent !py-2.5 !px-4 text-[10px]">uruchom_audyt</a>
        </div>
      </div>
    </nav>
  );
}
