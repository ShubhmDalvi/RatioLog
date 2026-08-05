"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

type Mode = "login" | "signup";

const COPY: Record<Mode, { title: string; subtitle: string }> = {
  login: {
    title: "Welcome Back",
    subtitle: "Sign in to review and record architecture decisions.",
  },
  signup: {
    title: "Create Your Account",
    subtitle: "Start recording architecture decisions in minutes.",
  },
};

export function AuthForm({ allowSignup = true }: { allowSignup?: boolean }) {
  const [mode, setMode] = useState<Mode>("login");

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink">
        {COPY[mode].title}
      </h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-muted">
        {COPY[mode].subtitle}
      </p>

      {allowSignup ? (
        <div
          role="tablist"
          aria-label="Authentication mode"
          className="relative mt-5 mb-6 grid grid-cols-2 rounded-lg bg-white/[0.06] p-1"
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-md bg-[#18181B] shadow-sm ring-1 ring-white/[0.08] transition-transform duration-200 ease-out",
              mode === "signup" && "translate-x-full",
            )}
          />
          {(
            [
              { id: "login", label: "Log In" },
              { id: "signup", label: "Sign Up" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={mode === item.id}
              onClick={() => setMode(item.id)}
              className={cn(
                "relative z-10 rounded-md py-1.5 text-[13px] font-medium transition-colors",
                mode === item.id
                  ? "text-white"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-4 mb-5 text-[12px] text-ink-muted">
          New accounts are invite-only.
        </p>
      )}

      {mode === "login" || !allowSignup ? (
        <div key="login" className="animate-in fade-in-0 duration-200">
          <LoginForm />
        </div>
      ) : (
        <div key="signup" className="animate-in fade-in-0 duration-200">
          <SignupForm />
        </div>
      )}
    </div>
  );
}
