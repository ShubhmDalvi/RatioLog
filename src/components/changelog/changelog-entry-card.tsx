import { format } from "date-fns";
import { ArrowRight, Pencil, Sparkles } from "lucide-react";
import Link from "next/link";

import type { ChangelogEntryWithAuthor } from "@/lib/changelog";

import { Markdown } from "@/components/markdown";
import { TagChip } from "@/components/tag-chip";
import { ChangelogTypeBadge } from "./changelog-type-badge";
import { DeleteChangelogEntryButton } from "./delete-changelog-entry-button";
import { ChangelogEntrySheet } from "./changelog-entry-sheet";

function entryToForm(entry: ChangelogEntryWithAuthor) {
  return {
    id: entry.id,
    title: entry.title,
    description: entry.description,
    type: entry.type,
    date: entry.date,
    scope: entry.scope,
    decisionId: entry.decision?.id ?? "",
  };
}

export function ChangelogEntryCard({
  entry,
  canManage,
  decisions = [],
}: {
  entry: ChangelogEntryWithAuthor;
  canManage: boolean;
  decisions?: { id: string; title: string }[];
}) {
  const author = entry.createdBy.name ?? entry.createdBy.email;
  const isAuto = entry.source !== "MANUAL";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-white/[0.06] bg-[#18181B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-colors hover:border-white/[0.15]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          <ChangelogTypeBadge type={entry.type} className="mt-0.5" />
          <span className="truncate text-sm font-medium tracking-tight text-white">
            {entry.title}
          </span>
          {isAuto ? (
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-[4px] bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
              <Sparkles className="size-2.5" />
              Auto
            </span>
          ) : null}
        </div>
        {canManage ? (
          <div className="flex shrink-0 items-center gap-1">
            <ChangelogEntrySheet
              mode="edit"
              entry={entryToForm(entry)}
              decisions={decisions}
              trigger={
                <button
                  type="button"
                  aria-label="Edit"
                  title="Edit"
                  className="flex h-7 items-center rounded-md px-1.5 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <Pencil className="size-3.5" />
                </button>
              }
            />
            <DeleteChangelogEntryButton id={entry.id} />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
        {entry.scope ? (
          <TagChip>{entry.scope}</TagChip>
        ) : null}
        {entry.decision ? (
          <Link
            href={`/decisions/${entry.decision.id}`}
            className="group inline-flex items-center gap-1 text-[11px] font-medium text-brand transition-colors hover:text-brand-hover"
          >
            View decision — {entry.decision.title}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>

      {entry.description.trim() ? <Markdown content={entry.description} /> : null}

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="truncate text-xs text-ink-muted">{author}</span>
        <time
          dateTime={entry.date.toISOString()}
          className="shrink-0 text-xs text-ink-muted"
        >
          {format(entry.date, "MMMM d, yyyy")}
        </time>
      </div>
    </div>
  );
}
