"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

import { signupAction, type SignupState } from "./actions";

function FieldError({ error }: { error: string[] | undefined }) {
  if (!error?.[0]) {
    return null;
  }
  return (
    <p role="alert" className="text-xs text-destructive">
      {error[0]}
    </p>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState<SignupState, FormData>(
    signupAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label
          htmlFor="name"
          className="mb-1.5 block text-[12px] font-medium text-zinc-400"
        >
          Name <span className="font-normal text-white/40">(optional)</span>
        </Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="signup-email"
          className="mb-1.5 block text-[12px] font-medium text-zinc-400"
        >
          Email
        </Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
        <FieldError error={state?.fieldErrors?.email} />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="signup-password"
          className="mb-1.5 block text-[12px] font-medium text-zinc-400"
        >
          Password
        </Label>
        <PasswordInput
          id="signup-password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          required
        />
        <FieldError error={state?.fieldErrors?.password} />
      </div>

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <Button
        type="submit"
        className="h-9 w-full rounded-lg px-4 shadow-sm"
        disabled={pending}
      >
        {pending ? "Creating Account…" : "Create Account"}
      </Button>
    </form>
  );
}
