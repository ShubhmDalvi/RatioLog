import { cn } from "@/lib/utils";
import {
  CHANGELOG_TYPE_BADGE_STYLES,
  CHANGELOG_TYPE_LABELS,
} from "@/lib/changelog/status";
import type { ChangelogType } from "@/lib/changelog/status";

export function ChangelogTypeBadge({
  type,
  className,
}: {
  type: ChangelogType;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] w-fit shrink-0 items-center rounded-[5px] border px-2 py-0.5 text-[11px] font-medium leading-none tracking-tight",
        CHANGELOG_TYPE_BADGE_STYLES[type],
        className,
      )}
    >
      {CHANGELOG_TYPE_LABELS[type]}
    </span>
  );
}
