import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function DecisionNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-start gap-2">
      <p className="font-mono text-xs font-semibold tracking-widest text-brand">
        404
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">
        Decision Not Found
      </h1>
      <p className="text-sm leading-relaxed text-ink-muted">
        This decision may have been deleted, or the link is incorrect.
      </p>
      <Button asChild className="mt-3">
        <Link href="/decisions">Back to Decisions</Link>
      </Button>
    </div>
  );
}
