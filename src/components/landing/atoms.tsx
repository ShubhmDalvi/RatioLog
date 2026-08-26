/**
 * Shared editorial building blocks for the landing page — one consistent
 * "filed record" voice: mono kickers, section numbers, generous headlines.
 */

export function SectionHeader({
  index,
  kicker,
  title,
  lede,
}: {
  index: string;
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <div className="mb-12 max-w-xl sm:mb-14">
      <p className="font-mono text-[12px] font-medium uppercase tracking-[0.1em] text-brand">
        {"\u00A7"}{index} &mdash; {kicker}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {lede ? (
        <p className="mt-4 text-base leading-relaxed text-ink-muted">{lede}</p>
      ) : null}
    </div>
  );
}

export function MonoLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.04em] text-zinc-500 ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusPillAccepted() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
      Accepted
    </span>
  );
}
