import { Bookmark, FileText, History, Plus } from "lucide-react";

import { Logo } from "@/components/brand/logo";

const STATUS_STYLES = {
  accepted: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  superseded: "border-purple-500/20 bg-purple-500/10 text-purple-400",
  proposed: "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
} as const;

type Status = keyof typeof STATUS_STYLES;

function StatusPill({ status, label }: { status: Status; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[status]}`}
    >
      {label}
    </span>
  );
}

function MockCard({
  title,
  preview,
  tag,
  date,
  status,
  statusLabel,
}: {
  title: string;
  preview: string;
  tag: string;
  date: string;
  status: Status;
  statusLabel: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#18181B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium tracking-tight text-white">
          {title}
        </span>
        <StatusPill status={status} label={statusLabel} />
      </div>
      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
        {preview}
      </p>
      <div className="flex items-center justify-between pt-2">
        <span className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-400">
          {tag}
        </span>
        <span className="text-xs text-ink-faint">{date}</span>
      </div>
    </div>
  );
}

/**
 * Pure CSS replica of the app UI — no image assets, stays crisp at any DPI.
 */
export function CssMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[880px]">
      {/* glow */}
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -top-8 bottom-0 rounded-[32px] bg-brand/[0.04] blur-2xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0D0D10] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)] ring-1 ring-black/40">
        {/* browser chrome */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#111114] px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#FF5F57]/70" />
            <span className="size-2.5 rounded-full bg-[#FEBC2E]/70" />
            <span className="size-2.5 rounded-full bg-[#28C840]/70" />
          </div>
          <div className="mx-auto flex h-6 w-full max-w-[280px] items-center justify-center rounded-md bg-white/[0.05] text-[11px] text-zinc-500">
            ratiolog.app/decisions
          </div>
          <div className="w-10" />
        </div>

        <div className="flex min-h-[420px] text-left max-md:min-h-[380px]">
          {/* sidebar */}
          <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-white/[0.06] p-3 sm:flex">
            <div className="mb-4 flex items-center gap-2 px-1.5">
              <Logo size={18} />
              <span className="text-[13px] font-bold tracking-tight text-white">
                RatioLog
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-white/[0.08] px-2 py-1.5 text-[12px] font-medium text-white">
              <FileText className="size-3.5 text-brand" strokeWidth={1.75} />
              Decisions
            </div>
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-zinc-400">
              <History className="size-3.5" strokeWidth={1.75} />
              Changelog
            </div>
            <div className="mb-2 mt-5 px-2 text-[9px] font-semibold uppercase tracking-[0.06em] text-zinc-600">
              Pinned
            </div>
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-zinc-400">
              <Bookmark className="size-3" strokeWidth={1.75} />
              <span className="truncate">Turso in prod</span>
            </div>
            <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-zinc-400">
              <Bookmark className="size-3" strokeWidth={1.75} />
              <span className="truncate">Auth.js sessions</span>
            </div>
          </div>

          {/* content */}
          <div className="min-w-0 flex-1 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold tracking-tight text-white">
                  Decisions
                </div>
                <div className="text-[11px] text-zinc-500">
                  Architecture decision records for your project.
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-medium text-black">
                <Plus className="size-3" strokeWidth={2.25} />
                New Decision
              </div>
            </div>

            <div className="mb-4 flex gap-1.5">
              <span className="rounded-full border border-white/[0.1] bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-white">
                All
              </span>
              <span className="rounded-full px-2.5 py-1 text-[10px] text-zinc-500">
                Accepted
              </span>
              <span className="rounded-full px-2.5 py-1 text-[10px] text-zinc-500">
                Proposed
              </span>
              <span className="rounded-full px-2.5 py-1 text-[10px] text-zinc-500">
                Superseded
              </span>
            </div>

            <div className="space-y-2.5">
              <MockCard
                title="Adopt Turso for production workloads"
                preview="Concurrent writes outgrew the file database. Turso keeps the SQLite dialect we develop against and gives us hosted backups from day one."
                tag="database"
                date="Mar 1, 2026"
                status="accepted"
                statusLabel="Accepted"
              />
              <MockCard
                title="Move auth to session cookies"
                preview="LocalStorage tokens were vulnerable to XSS and impossible to revoke. HttpOnly cookies with server-side sessions fix both."
                tag="auth"
                date="Feb 18, 2026"
                status="accepted"
                statusLabel="Accepted"
              />
              <MockCard
                title="Use SQLite for local development"
                preview="Zero-config setup for new machines. Superseded once the schema needed extensions SQLite can't provide."
                tag="tooling"
                date="Feb 10, 2026"
                status="superseded"
                statusLabel="Superseded"
              />
              <MockCard
                title="Cache invalidation via event bus"
                preview="Evaluating whether a lightweight pub/sub layer beats manual revalidation as the app grows."
                tag="architecture"
                date="Aug 20, 2026"
                status="proposed"
                statusLabel="Proposed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
