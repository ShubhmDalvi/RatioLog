"use client";

import { Button } from "@/components/ui/button";

export function NewDecisionButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      onClick={() => window.dispatchEvent(new Event("ratiolog:open-new"))}
    >
      {children}
    </Button>
  );
}
