import { format } from "date-fns";
import Link from "next/link";

import type { DecisionListItem } from "@/lib/decisions";
import { markdownPreview } from "@/lib/decisions/preview";
import { safeParseTags } from "@/lib/decisions/tags";
import { TagChip } from "@/components/tag-chip";
import { DraftTag } from "./draft-tag";
import { StatusBadge } from "./status-badge";

export function DecisionCard({ decision }: { decision: DecisionListItem }) {
  const tags = safeParseTags(decision.tags);
  const preview = markdownPreview(decision.context || decision.decision);

  return (
    <Link
      href={`/decisions/${decision.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#18181B] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-all duration-200 hover:border-white/[0.15] hover:bg-[#1E1E22] hover:shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-medium tracking-tight text-white">
            {decision.title}
          </span>
          {decision.isPrivate ? <DraftTag /> : null}
        </div>
        <StatusBadge status={decision.status} />
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
