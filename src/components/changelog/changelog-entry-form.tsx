"use client";

import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  createChangelogEntryAction,
  updateChangelogEntryAction,
  type ChangelogResult,
} from "@/app/(app)/changelog/actions";
import { AutoTextarea } from "@/components/ui/auto-textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DecisionCombobox } from "@/components/decisions/decision-combobox";
import {
  CHANGELOG_TYPE_LABELS,
  CHANGELOG_TYPES,
} from "@/lib/changelog/status";
import type { ChangelogType } from "@/lib/changelog/status";
import { cn } from "@/lib/utils";

export type ChangelogEntryFormEntry = {
  id: string;
  title: string;
  description: string;
  type: ChangelogType;
  date: Date;
  scope: string;
  decisionId: string;
};

type ChangelogEntryFormProps = {
  mode: "create" | "edit";
  entry?: ChangelogEntryFormEntry;
  decisions?: { id: string; title: string }[];
  onCancel?: () => void;
};

const NO_DECISION = "__none__";

function FieldError({ error }: { error: string[] | undefined }) {
  if (!error?.[0]) {
    return null;
  }
  return <p className="text-xs text-destructive">{error[0]}</p>;
}

export function ChangelogEntryForm({
  mode,
  entry,
  decisions = [],
  onCancel,
}: ChangelogEntryFormProps) {
  const router = useRouter();
  const action =
    mode === "edit" ? updateChangelogEntryAction : createChangelogEntryAction;
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raf = requestAnimationFrame(() => titleRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, []);

  const [result, setResult] = useState<ChangelogResult>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<ChangelogType>(entry?.type ?? "CHANGED");
  const [decisionId, setDecisionId] = useState(entry?.decisionId ?? "");

  const errors = result && !result.ok ? result : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSubmitting(true);
    setResult(undefined);

    try {
      const res = await action(formData);

      if (res.ok) {
        toast.success(
          mode === "edit" ? "Changelog Entry Updated" : "Changelog Entry Created",
        );
        onCancel?.();
        router.refresh();
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
      <input type="hidden" name="id" value={entry?.id ?? ""} />
      <input type="hidden" name="type" value={type} />
      <input
        type="hidden"
        name="decisionId"
        value={decisionId === NO_DECISION ? "" : decisionId}
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
            placeholder="e.g. Published ADR-012: Adopt PostgreSQL"
            defaultValue={entry?.title}
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
              Type
            </Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as ChangelogType)}
            >
              <SelectTrigger className="h-9 rounded-lg border-white/[0.1] bg-white/[0.03] text-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.3)] focus:border-white/30 focus:ring-1 focus:ring-white/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANGELOG_TYPES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {CHANGELOG_TYPE_LABELS[item]}
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
                entry
                  ? format(entry.date, "yyyy-MM-dd")
                  : format(new Date(), "yyyy-MM-dd")
              }
            />
            <FieldError error={errors?.fieldErrors?.date} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="scope"
            className="mb-1.5 block text-[12px] font-medium text-zinc-400"
          >
            Scope
          </Label>
          <Input
            id="scope"
            name="scope"
            placeholder="e.g. API, Auth, Infrastructure"
            defaultValue={entry?.scope}
            className={cn(
              errors?.fieldErrors?.scope &&
                "border-destructive focus-visible:border-destructive",
            )}
          />
          <FieldError error={errors?.fieldErrors?.scope} />
          <p className="text-xs text-ink-muted">
            Optional — the part of the system this change touches.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label className="mb-1.5 block text-[12px] font-medium text-zinc-400">
            Related Decision
          </Label>
          <DecisionCombobox
            value={decisionId}
            onChange={(value) =>
              setDecisionId(value === "" ? NO_DECISION : value)
            }
            options={decisions}
            placeholder="— None —"
          />
          <p className="text-xs text-ink-muted">
            Optional — link this entry to an existing decision.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="description"
            className="mb-1.5 block text-[12px] font-medium text-zinc-400"
          >
            Description
          </Label>
          <AutoTextarea
            id="description"
            name="description"
            rows={6}
            placeholder="What changed, and why it matters."
            defaultValue={entry?.description}
            className="min-h-[120px]"
          />
          <p className="text-xs text-ink-muted">Markdown supported.</p>
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

      <div className="flex shrink-0 items-center justify-end gap-3 border-t border-white/[0.08] bg-[#141417]/90 p-4 px-8 backdrop-blur-md">
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
            "Save Entry"
          ) : (
            "Create Entry"
          )}
        </Button>
      </div>
    </form>
  );
}
