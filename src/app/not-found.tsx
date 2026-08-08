import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFound() {
  return (
    <main className="app-shell flex min-h-dvh flex-col items-center justify-center gap-4 overflow-hidden px-4 py-4 text-center sm:gap-7 sm:py-6">
      <div className="flex items-center gap-3">
        <Logo size={28} />
        <span className="text-lg font-bold tracking-tight text-ink sm:text-xl">
          RatioLog
        </span>
      </div>

      <p className="animate-in fade-in-0 duration-500 font-mono text-7xl font-semibold tracking-tight text-ink sm:text-8xl md:text-9xl">
        4<span className="text-brand">0</span>4
      </p>

      <div className="flex flex-col items-center gap-1.5">
        <h1 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
          Page not found
        </h1>
        <p className="max-w-[30ch] text-sm leading-relaxed text-ink-muted sm:max-w-sm sm:text-base">
          This route doesn&apos;t exist in the log — it was rejected, superseded,
          or never written.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </main>
  );
}
