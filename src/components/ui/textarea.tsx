import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.4)] transition-all outline-none placeholder:text-zinc-600 focus-visible:border-white/30 focus-visible:ring-1 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 md:text-[13px] dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
