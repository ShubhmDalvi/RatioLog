import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/decisions/status";
import type { DecisionStatus } from "@/lib/decisions/status";

import { STATUS_BADGE_STYLES } from "./status-styles";

export function StatusBadge({
  status,
  className,
}: {
  status: DecisionStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] w-fit shrink-0 items-center rounded-[5px] border px-2 py-0.5 text-[11px] font-medium leading-none tracking-tight",
        STATUS_BADGE_STYLES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
