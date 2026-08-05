"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { changePasswordAction } from "@/app/(app)/settings/actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

type Result =
  | { ok: true }
  | {
      ok: false;
      fieldErrors?: Record<string, string[] | undefined>;
      error?: string;
    };

function FieldError({ error }: { error: string[] | undefined }) {
  if (!error?.[0]) {
    return null;
  }
  return <p className="text-xs text-destructive">{error[0]}</p>;
}

export function PasswordForm() {
  const [result, setResult] = useState<Result>();
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSaving(true);
    setResult(undefined);

    try {
      const res = await changePasswordAction(formData);
      if (res.ok) {
        toast.success("Password Changed");
        event.currentTarget.reset();
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
          htmlFor="current-password"
          className="mb-1.5 block text-[12px] font-medium text-zinc-400"
        >
          Current Password
        </Label>
        <PasswordInput
          id="current-password"
          name="currentPassword"
          autoComplete="current-password"
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label
            htmlFor="new-password"
            className="mb-1.5 block text-[12px] font-medium text-zinc-400"
          >
            New Password
          </Label>
          <PasswordInput
            id="new-password"
            name="newPassword"
            autoComplete="new-password"
            inputClassName={cn(
              errors?.fieldErrors?.newPassword &&
                "border-destructive focus-visible:border-destructive",
            )}
          />
          <FieldError error={errors?.fieldErrors?.newPassword} />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="confirm-password"
            className="mb-1.5 block text-[12px] font-medium text-zinc-400"
          >
            Confirm New Password
          </Label>
          <PasswordInput
            id="confirm-password"
            name="confirmPassword"
            autoComplete="new-password"
            inputClassName={cn(
              errors?.fieldErrors?.confirmPassword &&
                "border-destructive focus-visible:border-destructive",
            )}
          />
          <FieldError error={errors?.fieldErrors?.confirmPassword} />
        </div>
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
          Change Password
        </Button>
      </div>
    </form>
  );
}
