"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { DecisionForm, type DecisionFormDecision } from "./decision-form";

type DecisionFormSheetProps = {
  mode: "create" | "edit";
  openParam: "new" | "edit";
  trigger: React.ReactNode;
  decision?: DecisionFormDecision;
  decisions?: { id: string; title: string }[];
  tags?: string[];
};

/**
 * Right slide-over panel for creating / editing a decision. Auto-opens when
 * the matching search param (`?new=1` / `?edit=1`) is present so deep links
 * keep working after the dedicated routes become redirects.
 */
export function DecisionFormSheet({
  mode,
  openParam,
  trigger,
  decision,
  decisions,
  tags,
}: DecisionFormSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = !useMediaQuery("(min-width: 640px)");

  const [open, setOpen] = useState(
    () => searchParams.get(openParam) === "1",
  );

  // Allow server-rendered CTAs (e.g. the empty state) to open this sheet.
  useEffect(() => {
    const handle = () => setOpen(true);
    window.addEventListener("ratiolog:open-new", handle);
    return () => window.removeEventListener("ratiolog:open-new", handle);
  }, []);

  // If auto-opened, clean the search param from the URL.
  useEffect(() => {
    if (searchParams.get(openParam) !== "1") {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(openParam);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [openParam, pathname, router, searchParams]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "flex w-full flex-col gap-0 rounded-t-2xl border-t border-white/[0.08] bg-[#141417] p-0 shadow-2xl !h-[92dvh]"
            : "flex h-full w-full flex-col gap-0 border-l border-white/[0.08] bg-[#141417] p-0 shadow-2xl sm:max-w-3xl"
        }
      >
        {isMobile ? (
          <span
            aria-hidden="true"
            className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/[0.15]"
          />
        ) : null}
        <SheetHeader className="border-b border-white/[0.08] px-8 py-5 pr-14">
          <SheetTitle className="text-xl font-semibold tracking-tight text-white">
            {mode === "edit" ? "Edit Decision" : "New Decision"}
          </SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? decision?.title
              : "Record a decision with context and rationale."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col">
          <DecisionForm
            mode={mode}
            decision={decision}
            decisions={decisions}
            availableTags={tags}
            onCancel={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
