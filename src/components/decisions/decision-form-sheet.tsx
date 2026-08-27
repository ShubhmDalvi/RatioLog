"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getDecisionTemplate } from "@/lib/decisions/templates";

import { DecisionForm, type DecisionFormDecision } from "./decision-form";

type DecisionFormSheetProps = {
  mode: "create" | "edit";
  openParam: "new" | "edit";
  trigger: React.ReactNode;
  decision?: DecisionFormDecision;
  decisions?: { id: string; title: string }[];
  tags?: string[];
  userId?: string;
};

/**
 * Decisions form — bottom sheet on mobile, centered dialog on desktop.
 * Auto-opens when the matching search param (`?new=1` / `?edit=1`) is present
 * so deep links keep working. `?t=<id>` prefills a starter template.
 *
 * Closing semantics: create mode autosaves a local draft, so it closes freely
 * and the restored-draft notice offers "Start fresh". Edit mode has no such
 * safety net, so unsaved edits ask for confirmation first.
 */
export function DecisionFormSheet({
  mode,
  openParam,
  trigger,
  decision,
  decisions,
  tags,
  userId,
}: DecisionFormSheetProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isMobile = !useMediaQuery("(min-width: 640px)");
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard: avoids Sheet/Dialog flash on first paint
  useEffect(() => setMounted(true), []);

  // Captured from the URL, either at mount or when params change on the same
  // page (template links navigate without remounting this component).
  const [templateId, setTemplateId] = useState<string | undefined>(
    () => searchParams.get("t") ?? undefined,
  );

  const [open, setOpen] = useState(
    () => searchParams.get(openParam) === "1",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Dirty flag lives in a ref: it updates synchronously (no stale reads when
  // a save and a close race) and is never rendered directly.
  const isDirtyRef = useRef(false);
  function handleDirtyChange(dirty: boolean) {
    isDirtyRef.current = dirty;
  }

  // React to URL-driven opens on client-side navigation (same route): the
  // component doesn't remount, so initializers alone can't see new params.
  const [lastParams, setLastParams] = useState(searchParams);
  if (lastParams !== searchParams) {
    setLastParams(searchParams);
    if (searchParams.get(openParam) === "1") {
      setOpen(true);
      const t = searchParams.get("t");
      if (t) {
        setTemplateId(t);
      }
    }
  }

  // Allow server-rendered CTAs (e.g. the empty state) to open this sheet.
  useEffect(() => {
    const handle = () => {
      setTemplateId(undefined);
      setOpen(true);
    };
    window.addEventListener("ratiolog:open-new", handle);
    return () => window.removeEventListener("ratiolog:open-new", handle);
  }, []);

  // If auto-opened, clean the search params from the URL.
  useEffect(() => {
    if (
      searchParams.get(openParam) !== "1" &&
      searchParams.get("t") === null
    ) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.delete(openParam);
    params.delete("t");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [openParam, pathname, router, searchParams]);

  function requestClose() {
    // Create mode autosaves a local draft, so closing is always safe — the
    // restored-draft notice offers "Start fresh" for a real discard. Edit mode
    // has no draft safety net, so unsaved edits still ask first.
    if (mode === "edit" && isDirtyRef.current) {
      setConfirmOpen(true);
      return;
    }
    setOpen(false);
  }

  function markCleanAndClose() {
    isDirtyRef.current = false;
    setConfirmOpen(false);
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      requestClose();
      return;
    }
    // Opened via the trigger button — never carry an old template over.
    setTemplateId(undefined);
    setOpen(true);
  }

  function discardAndClose() {
    isDirtyRef.current = false;
    setConfirmOpen(false);
    setOpen(false);
  }

  const template = mode === "create" ? getDecisionTemplate(templateId) : undefined;
  const defaults = template
    ? {
        title: template.title,
        tags: [...template.tags],
        context: template.context,
        decision: template.decision,
        consequences: template.consequences,
      }
    : undefined;

  const headerTitle = mode === "edit" ? "Edit Decision" : "New Decision";
  const headerDescription =
    mode === "edit"
      ? (decision?.title ?? "")
      : template
        ? `Starter template — ${template.label.toLowerCase()}. Make it yours.`
        : "Record a decision with context and rationale.";

  const confirmDialog = (
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent className="max-w-sm gap-0">
        <DialogHeader>
          <DialogTitle>Discard unsaved changes?</DialogTitle>
          <DialogDescription>
            Your edits haven&apos;t been saved. Closing now will lose them
            {mode === "create"
              ? " — though a draft stays on this device."
              : "."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-5 gap-2">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Keep editing
          </Button>
          <Button variant="destructive" onClick={discardAndClose}>
            Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Avoid hydration mismatch: useMediaQuery is SSR-safe (false on server →
  // isMobile=true). Until mounted, render just the trigger so the first paint
  // doesn't flash the wrong container. The trigger becomes interactive after mount.
  if (!mounted) {
    return (
      <>
        {trigger}
        {confirmDialog}
      </>
    );
  }

  // Mobile: bottom sheet — exactly as before, untouched
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={handleOpenChange}>
          <SheetTrigger asChild>{trigger}</SheetTrigger>
          <SheetContent
            side="bottom"
            className="flex w-full flex-col gap-0 rounded-t-2xl border-t border-white/[0.08] bg-[#141417] p-0 shadow-2xl !h-[92dvh]"
          >
            <span
              aria-hidden="true"
              className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/[0.15]"
            />
            <SheetHeader className="border-b border-white/[0.08] px-8 py-5 pr-14">
              <SheetTitle className="text-xl font-semibold tracking-tight text-white">
                {headerTitle}
              </SheetTitle>
              <SheetDescription>{headerDescription}</SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col">
              <DecisionForm
                mode={mode}
                decision={decision}
                defaults={defaults}
                decisions={decisions}
                availableTags={tags}
                userId={userId}
                onCancel={requestClose}
                onSaved={markCleanAndClose}
                onDirtyChange={handleDirtyChange}
              />
            </div>
          </SheetContent>
        </Sheet>
        {confirmDialog}
      </>
    );
  }

  // Desktop: centered dialog — same form, same vibe, more focus
  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            data-slot="dialog-overlay"
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md duration-100 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
          />
          <DialogPrimitive.Content
            data-slot="dialog-content"
            aria-describedby={undefined}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[min(720px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col gap-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141417] p-0 shadow-2xl duration-200 outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            <div className="border-b border-white/[0.08] px-8 py-5 pr-14">
              <DialogPrimitive.Title className="text-xl font-semibold tracking-tight text-white">
                {headerTitle}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-1.5 text-sm text-muted-foreground">
                {headerDescription}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <DecisionForm
                mode={mode}
                decision={decision}
                defaults={defaults}
                decisions={decisions}
                availableTags={tags}
                userId={userId}
                onCancel={requestClose}
                onSaved={markCleanAndClose}
                onDirtyChange={handleDirtyChange}
              />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>
      {confirmDialog}
    </>
  );
}
