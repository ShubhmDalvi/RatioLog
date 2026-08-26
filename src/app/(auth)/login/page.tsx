import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";

import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  // Signups are open by default; set ALLOW_SIGNUP=false to make them invite-only.
  const allowSignup = process.env.ALLOW_SIGNUP !== "false";

  return (
    <main className="flex min-h-screen items-center justify-center bg-desk px-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-white/[0.08] bg-[#141417] p-8 shadow-2xl">
        <Link
          href="/"
          className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Logo size={36} />
          <span className="text-xl font-bold tracking-tight text-ink">
            RatioLog
          </span>
        </Link>

        <AuthForm allowSignup={allowSignup} />
      </div>
    </main>
  );
}
