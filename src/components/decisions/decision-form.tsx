"use client";

import { format } from "date-fns";
import { ChevronDown, Loader2, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  createDecisionAction,
  updateDecisionAction,
  type DecisionFormResult,
} from "@/app/(app)/decisions/actions";
import { AutoTextarea } from "@/components/ui/auto-textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Markdown } from "@/components/markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DECISION_STATUSES, STATUS_LABELS } from "@/lib/decisions/status";
import type { DecisionStatus } from "@/lib/decisions/status";
import { cn } from "@/lib/utils";

import { DecisionCombobox } from "./decision-combobox";
import { TagInput } from "./tag-input";

const NO_SUPERSEDES = "__none__";
const LEGACY_DRAFT_KEY = "ratiolog:create-draft";

// Drafts are scoped per account so they can never leak across logins on a
// shared browser. The legacy unscoped key is migrated once on restore.
function draftKey(userId?: string): string {
  return `ratiolog:create-draft:${userId ?? "anon"}`;
}

export type DecisionFormDecision = {
  id: string;
  title: string;
  status: DecisionStatus;
  date: Date;
  tags: string[];
  context: string;
  decision: string;
  consequences: string;
  supersedesId: string | null;
};

export type DecisionFormDefaults = {
  title?: string;
  tags?: string[];
  context?: string;
  decision?: string;
  consequences?: string;
};

type DecisionFormProps = {
  mode: "create" | "edit";
  decision?: DecisionFormDecision;
  defaults?: DecisionFormDefaults;
  decisions?: { id: string; title: string }[];
  availableTags?: string[];
  userId?: string;
  onCancel?: () => void;
  /** Called after a successful save — closes the sheet without the dirty guard. */
  onSaved?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
};

type PreviewKey = "context" | "decision" | "consequences";

function MarkdownField({
  id,
  label,
  name,
  value,
  onChange,
  rows,
  placeholder,
  preview,
  onTogglePreview,
}: {
  id: string;
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder?: string;
  preview: boolean;
  onTogglePreview: (preview: boolean) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-[12px] font-medium text-zinc-400">
          {label}
        </Label>
        <div
          role="group"
          aria-label={`${label} mode`}
          className="flex items-center gap-1.5"
        >
          {(
            [
              { key: "write", label: "Write", value: false },
              { key: "preview", label: "Preview", value: true },
            ] as const
          ).map((mode) => (
            <button
              key={mode.key}
              type="button"
              aria-pressed={preview === mode.value}
              onClick={() => onTogglePreview(mode.value)}
              className={cn(
                "text-[11px] font-medium transition-colors",
                preview === mode.value
                  ? "text-white"
                  : "text-zinc-500 hover:text-white",
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      {preview ? (
        <div className="min-h-[120px] overflow-y-auto rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-[13px]">
          <Markdown content={value} />
        </div>
      ) : (
        <AutoTextarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-[120px]"
        />
      )}
    </div>
  );
}

function FieldError({ error }: { error: string[] | undefined }) {
  if (!error?.[0]) {
    return null;
  }
  return <p className="text-xs text-destructive">{error[0]}</p>;
}

function toSafeStatus(value: unknown): DecisionStatus | null {
  return (DECISION_STATUSES as readonly string[]).includes(
    typeof value === "string" ? value : "",
  )
    ? (value as DecisionStatus)
    : null;
}

export function DecisionForm({
  mode,
  decision,
  defaults,
  decisions = [],
  availableTags = [],
  userId,
  onCancel,
  onSaved,
  onDirtyChange,
}: DecisionFormProps) {
  const router = useRouter();
  const action = mode === "edit" ? updateDecisionAction : createDecisionAction;
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  const [result, setResult] = useState<DecisionFormResult>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<DecisionStatus>(
    decision?.status ?? "PROPOSED",
  );
  const [supersedesId, setSupersedesId] = useState(
    decision?.supersedesId ?? NO_SUPERSEDES,
  );
  const [title, setTitle] = useState(decision?.title ?? defaults?.title ?? "");
  const [date, setDate] = useState(
    decision
      ? format(decision.date, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
  );
  const [tags, setTags] = useState<string[]>(
    decision?.tags ?? defaults?.tags ?? [],
  );
  const [context, setContext] = useState(
    decision?.context ?? defaults?.context ?? "",
  );
  const [decisionBody, setDecisionBody] = useState(
    decision?.decision ?? defaults?.decision ?? "",
  );
  const [consequences, setConsequences] = useState(
    decision?.consequences ?? defaults?.consequences ?? "",
  );
  const [preview, setPreview] = useState<Record<PreviewKey, boolean>>({
    context: false,
    decision: false,
    consequences: false,
  });
  const [detailsOpen, setDetailsOpen] = useState(mode === "edit");
  const [draftRestored, setDraftRestored] = useState(false);

  const supersedeOptions = decisions.filter((item) => item.id !== decision?.id);
  const errors = result && !result.ok ? result : undefined;

  // Non-default values tucked inside the collapsed Details drawer — shown as
  // a small badge so they aren't forgotten down there.
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const detailsBadgeCount =
    (status !== "PROPOSED" ? 1 : 0) +
    (date !== todayStr ? 1 : 0) +
    (tags.length > 0 ? 1 : 0) +
    (supersedesId !== NO_SUPERSEDES ? 1 : 0);

  // --- Draft safety (create mode): restore, autosave, dirty tracking -------
  // Baseline is captured once at first render; `isDirty` is a plain compare
  // against it. No effects needed to seed it.
  const [baseline, setBaseline] = useState<string>(() =>
    serialize({
      title: decision?.title ?? defaults?.title ?? "",
      status: decision?.status ?? "PROPOSED",
      date: decision
        ? format(decision.date, "yyyy-MM-dd")
        : format(new Date(), "yyyy-MM-dd"),
      tags: decision?.tags ?? defaults?.tags ?? [],
      context: decision?.context ?? defaults?.context ?? "",
      decisionBody: decision?.decision ?? defaults?.decision ?? "",
      consequences: decision?.consequences ?? defaults?.consequences ?? "",
      supersedesId: decision?.supersedesId ?? NO_SUPERSEDES,
    }),
  );

  function serialize(
    snapshot: {
      title: string;
      status: DecisionStatus;
      date: string;
      tags: string[];
      context: string;
      decisionBody: string;
      consequences: string;
      supersedesId: string;
    },
  ): string {
    return JSON.stringify(snapshot);
  }

  const currentSnapshot = () =>
    serialize({
      title,
      status,
      date,
      tags,
      context,
      decisionBody,
      consequences,
      supersedesId,
    });

  // Restore a saved draft once after mount (create mode, no template prefill).
  // Silent on purpose — the filled fields are the signal. The restoreAppliedRef
  // guard keeps StrictMode's double-mounted effects from running it twice.
  const restoreAppliedRef = useRef(false);
  useEffect(() => {
    if (mode !== "create" || decision || defaults) {
      return;
    }
    if (restoreAppliedRef.current) {
      return;
    }
    restoreAppliedRef.current = true;
    queueMicrotask(() => {
      let restored: Parameters<typeof serialize>[0] | null = null;
      const key = draftKey(userId);
      try {
        let raw = window.localStorage.getItem(key);
        if (raw === null) {
          // One-time migration from the old unscoped key.
          raw = window.localStorage.getItem(LEGACY_DRAFT_KEY);
          if (raw !== null) {
            window.localStorage.removeItem(LEGACY_DRAFT_KEY);
          }
        }
        if (raw) {
          const draft = JSON.parse(raw) as Record<string, unknown>;
          const safeStatus = toSafeStatus(draft.status) ?? "PROPOSED";
          restored = {
            title: typeof draft.title === "string" ? draft.title : "",
            status: safeStatus,
            date:
              typeof draft.date === "string" &&
              /^\d{4}-\d{2}-\d{2}$/.test(draft.date)
                ? draft.date
                : format(new Date(), "yyyy-MM-dd"),
            tags: Array.isArray(draft.tags) ? draft.tags.map(String) : [],
            context: typeof draft.context === "string" ? draft.context : "",
            decisionBody:
              typeof draft.decision === "string" ? draft.decision : "",
            consequences:
              typeof draft.consequences === "string" ? draft.consequences : "",
            supersedesId: NO_SUPERSEDES,
          };
        }
      } catch {
        restored = null;
      }

      if (restored) {
        setTitle(restored.title);
        setStatus(restored.status);
        setDate(restored.date);
        setTags(restored.tags);
        setContext(restored.context);
        setDecisionBody(restored.decisionBody);
        setConsequences(restored.consequences);
        setBaseline(serialize(restored));
        setDraftRestored(true);
      }
    });
    // Run once on mount. Microtasks can't be cancelled — nothing to clean up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = currentSnapshot() !== baseline;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Warn before leaving the page with unsaved edits (edit mode only — create
  // mode drafts survive refreshes via localStorage).
  useEffect(() => {
    if (mode !== "edit" || !isDirty) {
      return;
    }
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty, mode]);

  // Keep the latest snapshot in a ref so the create-mode unmount flush below
  // can save synchronously — even a close right after typing loses nothing.
  // Synced in an effect (not during render): React Compiler forbids ref
  // writes while rendering.
  const latestSnapshotRef = useRef(currentSnapshot());
  useEffect(() => {
    latestSnapshotRef.current = currentSnapshot();
  });
  const savedRef = useRef(false);

  useEffect(() => {
    if (mode !== "create") {
      return;
    }
    return () => {
      // A successful save already cleared the draft — don't resurrect it.
      if (savedRef.current) {
        return;
      }
      try {
        const snap = latestSnapshotRef.current;
        const parsed = JSON.parse(snap) as { title?: unknown };
        const hasTitle =
          typeof parsed?.title === "string" && parsed.title.trim() !== "";
        if (hasTitle) {
          window.localStorage.setItem(draftKey(userId), snap);
        } else {
          // Nothing worth keeping — an empty form restores as a clean slate.
          window.localStorage.removeItem(draftKey(userId));
        }
      } catch {
        // Best effort.
      }
    };
  }, [mode, userId]);

  function startFresh() {
    clearDraft();
    savedRef.current = false;
    setTitle("");
    setStatus("PROPOSED");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setTags([]);
    setContext("");
    setDecisionBody("");
    setConsequences("");
    setSupersedesId(NO_SUPERSEDES);
    const blank = serialize({
      title: "",
      status: "PROPOSED",
      date: format(new Date(), "yyyy-MM-dd"),
      tags: [],
      context: "",
      decisionBody: "",
      consequences: "",
      supersedesId: NO_SUPERSEDES,
    });
    setBaseline(blank);
    latestSnapshotRef.current = blank;
    setDraftRestored(false);
  }

  // Autosave the create draft (debounced).
  useEffect(() => {
    if (mode !== "create" || !isDirty) {
      return;
    }
    const timer = setTimeout(() => {
      try {
        window.localStorage.setItem(draftKey(userId), currentSnapshot());
      } catch {
        // Storage unavailable — autosave is best-effort.
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isDirty,
    baseline,
    title,
    status,
    date,
    tags,
    context,
    decisionBody,
    consequences,
    supersedesId,
    mode,
    userId,
  ]);

  function clearDraft() {
    try {
      window.localStorage.removeItem(draftKey(userId));
      window.localStorage.removeItem(LEGACY_DRAFT_KEY);
    } catch {
      // Ignore.
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);
    setResult(undefined);

    try {
      const res = await action(formData);

      if (res.ok) {
        toast.success(mode === "edit" ? "Decision Updated" : "Decision Created");
        if (mode === "create") {
          savedRef.current = true;
          clearDraft();
        }
        setBaseline(currentSnapshot());
        // Bypass the dirty guard — a successful save is, by definition, clean.
        onSaved?.();
        if (mode === "edit") {
          router.refresh();
        } else {
          router.push(`/decisions/${res.id}`);
        }
        return;
      }

      setResult(res);
      if (
        !res.ok &&
        (res.fieldErrors?.date ||
          res.fieldErrors?.tags ||
          res.fieldErrors?.supersedesId)
      ) {
        // Those fields live inside Details — open it so the errors are
        // visible instead of hidden in the collapsed drawer.
        setDetailsOpen(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          if (!isSubmitting) {
            event.currentTarget.requestSubmit();
          }
        }
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      <input type="hidden" name="id" value={decision?.id ?? ""} />
      <input type="hidden" name="status" value={status} />
      {/* Always present so submit works with the Details drawer collapsed. */}
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="tags" value={tags.join(", ")} />
      {/* Always present so submit works while a section is in Preview mode
          (preview unmounts the textarea, which would otherwise drop the
          value from FormData and silently blank the section). When the
          textarea is mounted it comes later in the form, so its value wins. */}
      <input type="hidden" name="context" value={context} />
      <input type="hidden" name="decision" value={decisionBody} />
      <input type="hidden" name="consequences" value={consequences} />
      <input
        type="hidden"
        name="supersedesId"
        value={supersedesId === NO_SUPERSEDES ? "" : supersedesId}
      />

      <div className="flex-1 space-y-6 overflow-y-auto p-8 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {draftRestored ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-brand/25 bg-brand/[0.07] px-3.5 py-2.5">
            <p className="text-xs text-brand">
              Draft restored — picked up where you left off.
            </p>
            <span className="flex shrink-0 items-center gap-2.5 text-xs">
              <button
                type="button"
                onClick={startFresh}
                className="text-zinc-400 transition-colors hover:text-white"
              >
                Start fresh
              </button>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => setDraftRestored(false)}
                className="text-zinc-500 transition-colors hover:text-white"
              >
                Dismiss
              </button>
            </span>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label
            htmlFor="title"
            className="mb-1.5 block text-[12px] font-medium text-zinc-400"
          >
            Title
          </Label>
          <Input
            ref={titleRef}
            id="title"
            name="title"
            placeholder="e.g. Adopt Turso for the decision store"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={cn(
              errors?.fieldErrors?.title &&
                "border-destructive focus-visible:border-destructive",
            )}
          />
          <FieldError error={errors?.fieldErrors?.title} />
        </div>

        <MarkdownField
          id="context"
          label="Context"
          name="context"
          value={context}
          onChange={setContext}
          rows={4}
          placeholder="The forces at play and why a decision is needed."
          preview={preview.context}
          onTogglePreview={(value) =>
            setPreview((p) => ({ ...p, context: value }))
          }
        />

        <MarkdownField
          id="decision"
          label="Decision"
          name="decision"
          value={decisionBody}
          onChange={setDecisionBody}
          rows={6}
          placeholder="What was decided, and the main reasons."
          preview={preview.decision}
          onTogglePreview={(value) =>
            setPreview((p) => ({ ...p, decision: value }))
          }
        />

        <MarkdownField
          id="consequences"
          label="Consequences"
          name="consequences"
          value={consequences}
          onChange={setConsequences}
          rows={4}
          placeholder="What becomes easier or more difficult as a result."
          preview={preview.consequences}
          onTogglePreview={(value) =>
            setPreview((p) => ({ ...p, consequences: value }))
          }
        />

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            aria-expanded={detailsOpen}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
          >
            <span className="flex items-center gap-2 text-[12px] font-medium text-zinc-400">
              <SlidersHorizontal className="size-3.5" strokeWidth={1.75} />
              Details
              <span className="hidden font-normal text-ink-faint sm:inline">
                — status, date, tags, supersedes
              </span>
              {!detailsOpen && detailsBadgeCount > 0 ? (
                <span
                  aria-label={`${detailsBadgeCount} detail${detailsBadgeCount === 1 ? "" : "s"} set`}
                  className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand/20 px-1.5 py-0.5 font-mono text-[10px] leading-none text-brand"
                >
                  {detailsBadgeCount}
                </span>
              ) : null}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-zinc-500 transition-transform duration-200",
                detailsOpen && "rotate-180",
              )}
            />
          </button>

          {detailsOpen ? (
            <div className="space-y-6 border-t border-white/[0.06] p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="mb-1.5 block text-[12px] font-medium text-zinc-400">
                    Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as DecisionStatus)}
                  >
                    <SelectTrigger className="h-9 rounded-lg border-white/[0.1] bg-white/[0.03] text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.3)] focus:border-white/30 focus:ring-1 focus:ring-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DECISION_STATUSES.map((item) => (
                        <SelectItem key={item} value={item}>
                          {STATUS_LABELS[item]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="date"
                    className="mb-1.5 block text-[12px] font-medium text-zinc-400"
                  >
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                  />
                  <FieldError error={errors?.fieldErrors?.date} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="mb-1.5 block text-[12px] font-medium text-zinc-400">
                  Tags
                </Label>
                <TagInput
                  value={tags}
                  onChange={setTags}
                  availableTags={availableTags}
                />
                <FieldError error={errors?.fieldErrors?.tags} />
              </div>

              <div className="space-y-1.5">
                <Label className="mb-1.5 block text-[12px] font-medium text-zinc-400">
                  Supersedes
                </Label>
                <DecisionCombobox
                  value={supersedesId === NO_SUPERSEDES ? "" : supersedesId}
                  onChange={(value) =>
                    setSupersedesId(value === "" ? NO_SUPERSEDES : value)
                  }
                  options={supersedeOptions}
                  placeholder="— None —"
                />
                <p className="text-xs text-ink-muted">
                  The earlier decision this one replaces.
                </p>
                <FieldError error={errors?.fieldErrors?.supersedesId} />
              </div>
            </div>
          ) : null}
        </div>

        {errors?.error ? (
          <p
            role="alert"
            className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errors.error}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.08] bg-[#141417]/90 p-4 px-8 backdrop-blur-md">
        <p className="hidden text-[11px] text-zinc-400 sm:block">
          Markdown supported &middot;{" "}
          <kbd className="rounded border border-white/[0.1] bg-white/[0.05] px-1 py-0.5 font-mono text-[10px] text-zinc-400">
            ⌘↵
          </kbd>{" "}
          to save
        </p>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            className="text-[13px] font-medium text-zinc-400 transition-colors hover:bg-transparent hover:text-white"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 rounded-lg px-4 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                {mode === "edit" ? "Saving…" : "Creating…"}
              </>
            ) : mode === "edit" ? (
              "Save Decision"
            ) : (
              "Create Decision"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
