"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
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

export type DecisionFormDecision = {
  id: string;
  title: string;
  status: DecisionStatus;
  date: Date;
  isPrivate: boolean;
  tags: string[];
  context: string;
  decision: string;
  consequences: string;
  supersedesId: string | null;
};

type DecisionFormProps = {
  mode: "create" | "edit";
  decision?: DecisionFormDecision;
  decisions?: { id: string; title: string }[];
  availableTags?: string[];
  onCancel?: () => void;
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

export function DecisionForm({
  mode,
  decision,
  decisions = [],
  availableTags = [],
  onCancel,
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
  const [isPrivate, setIsPrivate] = useState(decision?.isPrivate ?? false);
  const [tags, setTags] = useState<string[]>(decision?.tags ?? []);
  const [context, setContext] = useState(decision?.context ?? "");
  const [decisionBody, setDecisionBody] = useState(decision?.decision ?? "");
  const [consequences, setConsequences] = useState(
    decision?.consequences ?? "",
  );
  const [preview, setPreview] = useState<Record<PreviewKey, boolean>>({
    context: false,
    decision: false,
    consequences: false,
  });

  const supersedeOptions = decisions.filter((item) => item.id !== decision?.id);
  const errors = result && !result.ok ? result : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);
    setResult(undefined);

    try {
      const res = await action(formData);

      if (res.ok) {
        toast.success(mode === "edit" ? "Decision Updated" : "Decision Created");
        onCancel?.();
        if (mode === "edit") {
          router.refresh();
        } else {
          router.push(`/decisions/${res.id}`);
        }
        return;
      }

      setResult(res);
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
      <input type="hidden" name="isPrivate" value={isPrivate ? "true" : "false"} />
      <input type="hidden" name="tags" value={tags.join(", ")} />
      <input
        type="hidden"
        name="supersedesId"
        value={supersedesId === NO_SUPERSEDES ? "" : supersedesId}
      />

      <div className="flex-1 space-y-6 overflow-y-auto p-8 overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
            placeholder="e.g. Adopt PostgreSQL for the decision store"
            defaultValue={decision?.title}
            className={cn(
              errors?.fieldErrors?.title &&
                "border-destructive focus-visible:border-destructive",
            )}
          />
          <FieldError error={errors?.fieldErrors?.title} />
        </div>

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
              name="date"
              type="date"
              defaultValue={
                decision
                  ? format(decision.date, "yyyy-MM-dd")
                  : format(new Date(), "yyyy-MM-dd")
              }
            />
            <FieldError error={errors?.fieldErrors?.date} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="mb-1.5 block text-[12px] font-medium text-zinc-400">
            Visibility
          </Label>
          <Select
            value={isPrivate ? "private" : "shared"}
            onValueChange={(value) => setIsPrivate(value === "private")}
          >
            <SelectTrigger className="h-9 rounded-lg border-white/[0.1] bg-white/[0.03] text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.3)] focus:border-white/30 focus:ring-1 focus:ring-white/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shared">Shared With Team</SelectItem>
              <SelectItem value="private">Private Draft — Only You</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-ink-muted">
            Private drafts are only visible to you until published.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="mb-1.5 block text-[12px] font-medium text-zinc-400">
            Tags
          </Label>
          <TagInput value={tags} onChange={setTags} availableTags={availableTags} />
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
        <p className="text-[11px] text-zinc-400">
          Markdown supported in Context, Decision and Consequences.
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
