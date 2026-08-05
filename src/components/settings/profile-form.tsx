"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { updateNameAction } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Result =
  | { ok: true }
  | {
      ok: false;
      fieldErrors?: Record<string, string[] | undefined>;
      error?: string;
    };

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [result, setResult] = useState<Result>();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSaving(true);
    setResult(undefined);

    try {
      const res = await updateNameAction(formData);
      if (res.ok) {
        toast.success("Profile Updated");
        router.refresh();
        return;
      }
      setResult(res);
    } finally {
      setIsSaving(false);
    }
  }

  const errors = result && !result.ok ? result : undefined;

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
      <div className="space-y-1.5">
        <Label
          htmlFor="name"
          className="mb-1.5 block text-[12px] font-medium text-zinc-400"
        >
          Name
        </Label>
        <Input
          id="name"
          name="name"
          placeholder="Your name"
          defaultValue={name}
          className={cn(
            "max-w-sm",
            errors?.fieldErrors?.name &&
              "border-destructive focus-visible:border-destructive",
          )}
        />
        {errors?.fieldErrors?.name?.[0] ? (
          <p className="text-xs text-destructive">{errors.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="mb-1.5 block text-[12px] font-medium text-zinc-400"
        >
          Email
        </Label>
        <Input id="email" value={email} disabled readOnly className="max-w-sm" />
        <p className="text-xs text-ink-muted">
          Email is your sign-in identifier and can&apos;t be changed.
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

      <div>
        <Button
          type="submit"
          disabled={isSaving}
          className="h-9 rounded-lg px-4 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
