"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-2">
      <p className="font-mono text-xs font-semibold tracking-widest text-destructive">
        Something went wrong
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        This page hit an unexpected error.
      </h1>
      <p className="text-sm leading-relaxed text-ink-muted">
        Please try again. If the problem persists, reload the page.
      </p>
      <Button className="mt-3" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}
