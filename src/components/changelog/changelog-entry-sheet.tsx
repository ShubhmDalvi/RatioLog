"use client";

import { useState } from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  ChangelogEntryForm,
  type ChangelogEntryFormEntry,
} from "./changelog-entry-form";

type ChangelogEntrySheetProps = {
  mode: "create" | "edit";
  trigger: React.ReactNode;
  entry?: ChangelogEntryFormEntry;
  decisions?: { id: string; title: string }[];
};

export function ChangelogEntrySheet({
  mode,
  trigger,
  entry,
  decisions = [],
}: ChangelogEntrySheetProps) {
  const isMobile = !useMediaQuery("(min-width: 640px)");
  const [open, setOpen] = useState(false);

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
            {mode === "edit" ? "Edit Changelog Entry" : "New Changelog Entry"}
          </SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? entry?.title
              : "Record what changed in your project."}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col">
          <ChangelogEntryForm
            mode={mode}
            entry={entry}
            decisions={decisions}
            onCancel={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
