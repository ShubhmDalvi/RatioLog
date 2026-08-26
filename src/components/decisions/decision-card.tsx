import { Bookmark } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import type { DecisionListItem } from "@/lib/decisions";
import { markdownPreview } from "@/lib/decisions/preview";
import { safeParseTags } from "@/lib/decisions/tags";
import { TagChip } from "@/components/tag-chip";

import { StatusBadge } from "./status-badge";

export function DecisionCard({
  decision,
  index,
}: {
  decision: DecisionListItem;
  index?: number;
}) {
  const tags = safeParseTags(decision.tags);
  const preview = markdownPreview(decision.context || decision.decision);
  const isPinned = decision.pinnedBy.length > 0;

  return (
    <Link
      href={`/decisions/${decision.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#18181B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-200 hover:border-white/[0.15] hover:bg-[#1E1E22] hover:shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {isPinned ? (
            <Bookmark
              aria-label="Pinned"
              className="size-3.5 shrink-0 text-brand"
              fill="currentColor"
              strokeWidth={1.75}
            />
          ) : null}
          <span className="truncate text-sm font-medium tracking-tight text-white">
            {decision.title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {index !== undefined ? (
            <span className="font-mono text-[10px] tracking-[0.06em] text-zinc-600">
              {String(index).padStart(3, "0")}
            </span>
          ) : null}
          <StatusBadge status={decision.status} />
        </div>
      </div>

      {preview ? (
        <p className="line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
          {preview}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-1">
        {tags.length > 0 ? (
          <ul className="flex min-w-0 flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag}>
                <TagChip>{tag}</TagChip>
              </li>
            ))}
          </ul>
        ) : <span />}
        <time dateTime={decision.date.toISOString()} className="shrink-0 text-xs text-ink-muted">
          {format(decision.date, "MMM d, yyyy")}
        </time>
      </div>
    </Link>
  );
}
