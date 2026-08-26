import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { SectionHeader, StatusPillAccepted } from "./atoms";

/**
 * §02 — Anatomy of a decision: a CSS replica of a real decision document
 * annotated with what each section is for. The artifact teaches the artifact.
 */

function DocumentMock() {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#141417] p-5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)] sm:p-7">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
        <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-400">
          Proposed
        </span>
        <span className="font-mono text-[11px] text-zinc-500">adr-007</span>
      </div>

      <div className="border-b border-white/[0.06] py-5">
        <h3 className="text-xl font-semibold tracking-tight text-ink">
          Use an event bus for cache invalidation
        </h3>
        <p className="mt-2 text-sm text-ink-muted">August 20, 2026 &middot; you</p>
      </div>

      <div className="space-y-6 pt-6">
        <section>
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
            Context
          </h4>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">
            Manual revalidation calls are scattered across 40+ routes. Every new
            feature risks another stale-cache bug, and onboarding takes a week
            longer than it should.
          </p>
        </section>
        <section>
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
            Decision
          </h4>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink">
            Adopt a lightweight pub/sub event bus. Mutations publish
            invalidation events; each cache owns its subscription.
          </p>
        </section>
        <section>
          <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
            Consequences
          </h4>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">
            Easier: invalidation logic lives in one place. Harder: the event
            flow needs documentation of its own.
          </p>
        </section>
      </div>
    </div>
  );
}

const NOTES = [
  {
    n: "01",
    label: "Context",
    body: "The forces at play, written while they\u2019re still obvious to you. In six months, this is the part everyone forgets first.",
  },
  {
    n: "02",
    label: "Decision",
    body: "The call itself \u2014 and why it beat the alternatives. One honest paragraph. No ceremony.",
  },
  {
    n: "03",
    label: "Consequences",
    body: "What gets easier, what gets harder. Future you reads this before re-litigating the choice.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-[1080px] px-6 py-20 sm:py-24">
      <SectionHeader
        index="02"
        kicker="how it works"
        title="Anatomy of a decision"
        lede="Every entry in the log is three short sections. That\u2019s the whole discipline \u2014 and it\u2019s enough."
      />

      <div className="grid items-start gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <DocumentMock />

        <div className="space-y-7 sm:space-y-8">
          {NOTES.map((note) => (
            <div key={note.n} className="flex gap-4">
              <span className="font-mono text-[13px] font-medium leading-6 text-brand">
                {note.n}
              </span>
              <div className="min-w-0 border-l border-white/[0.08] pl-4">
                <h3 className="text-[15px] font-semibold tracking-tight text-ink">
                  {note.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  {note.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * §03 — the pitch, filed properly: the CTA rendered as a decision record.
 */
export function CallToAction() {
  return (
    <section className="mx-auto w-full max-w-[1080px] px-6 pb-20 sm:pb-28">
      <div className="relative mx-auto max-w-2xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141417] shadow-2xl">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[240px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/[0.07] blur-3xl"
        />

        <div className="relative p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-white/[0.06] pb-5">
            <span className="font-mono text-[12px] text-zinc-500">adr-000</span>
            <StatusPillAccepted />
            <span className="font-mono text-[11px] text-zinc-600">
              filed aug 2026
            </span>
          </div>

          <h2 className="pt-6 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Adopt RatioLog as the decision log
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Context
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                This project makes hundreds of choices. Most are forgotten the
                week they&rsquo;re made &mdash; and re-argued months later by
                people who were in the room.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Decision
              </h4>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink">
                Write decisions down as they happen: context, call,
                consequences. One quiet log.
              </p>
            </div>
            <div>
              <h4 className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-zinc-500">
                Consequences
              </h4>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                Easier: &ldquo;why is it like this?&rdquo; takes thirty seconds
                to answer. Harder: nothing we could find.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/[0.06] pt-7 text-center">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
            >
              Start your decision log
              <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
            <p className="mt-3 font-mono text-[11px] text-zinc-600">
              {"//"} ~30 seconds
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
