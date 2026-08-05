import { cn } from "@/lib/utils";

export function ToolbarButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-70 max-sm:px-1.5",
        className,
      )}
      {...props}
    />
  );
}
