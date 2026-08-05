type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] px-8 py-12 text-center max-sm:py-10">
      {icon ? (
        <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] text-brand ring-1 ring-white/[0.08]">
          {icon}
        </div>
      ) : null}
      <h2 className="text-base font-medium tracking-tight text-white">{title}</h2>
      <p className="max-w-sm text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
