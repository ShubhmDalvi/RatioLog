import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export function TagChip({
  children,
  onRemove,
  className,
}: {
  children: React.ReactNode;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[4px] border border-white/[0.06] bg-white/[0.05] px-1.5 py-0.5 text-[11px] font-medium text-zinc-300",
        className,
      )}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          aria-label={`Remove ${children}`}
          onClick={onRemove}
          className="text-zinc-400 transition-colors hover:text-white"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}
