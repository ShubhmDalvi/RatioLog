import { SectionHeader } from "./atoms";

/**
 * Features rendered as a changelog timeline — the product's own signature
 * layout, demonstrating the mechanic instead of describing it.
 */

const ENTRIES = [
  {
    dot: "bg-emerald-400",
    title: "Structure that sticks",
    description:
      "Every decision gets three sections — Context, Decision, Consequences — so future readers get the full story, not just the conclusion.",
  },
  {
    dot: "bg-amber-400",
    title: "The changelog writes itself",
    description:
      "Record a decision, change its status, retire it — each event lands on a running timeline automatically. Zero bookkeeping.",
  },
  {
    dot: "bg-purple-400",
    title: "Decisions that replace decisions",
    description:
      "When a better option shows up, link the new call to the old one. History stays intact instead of getting overwritten.",
  },
  {
    dot: "bg-indigo-400",
    title: "Find anything in a keystroke",
    description:
      "Press \u2318K and jump straight to any decision by title or tag. No folder spelunking, no \u201cwhere did we write that down\u2026\u201d",
  },
  {
    dot: "bg-emerald-400",
    title: "Pin what matters",
    description:
      "Keep the handful of load-bearing decisions one click away in the sidebar.",
  },
  {
    dot: "bg-rose-400",
    title: "Markdown, with a safety net",
    description:
      "Write in Markdown with a live preview per section. Tables, code blocks and lists render exactly how you\u2019d expect.",
  },
] as const;

export function Features() {
  return (
    <section className="relative border-y border-white/[0.06]">
      {/* faint dot-grid, fading at the edges */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 70% at 50% 35%, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 70% at 50% 35%, black 30%, transparent 75%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1080px] px-6 py-20 sm:py-24">
        <SectionHeader
          index="01"
          kicker="why ratiolog"
          title="Everything a decision needs to survive"
          lede="Not another wiki to maintain. A focused record of the calls that shape your project — and the reasons behind them."
        />

        <div className="mx-auto max-w-2xl">
          <ol className="relative space-y-9 border-l border-white/[0.08] pl-6">
            {ENTRIES.map((entry, i) => (
              <li key={entry.title} className="relative">
                <span
                  aria-hidden="true"
                  className={`absolute -left-[29px] top-1.5 size-2.5 rounded-full ring-4 ring-[#09090b] ${entry.dot}`}
                />
                <p className="font-mono text-[11px] tracking-[0.06em] text-zinc-600">
                  {String(i + 1).padStart(3, "0")}
                </p>
                <h3 className="mt-1.5 text-[15px] font-semibold tracking-tight text-ink">
                  {entry.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {entry.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
