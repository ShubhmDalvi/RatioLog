import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";

import { Features } from "./features";
import { CssMockup } from "./css-mockup";
import { CallToAction, HowItWorks } from "./how-it-works";

const GITHUB_URL = "https://github.com/ShubhmDalvi/RatioLog";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function Nav() {
  return (
    <header className="relative mx-auto flex w-full max-w-[1080px] items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo size={26} />
        <span className="text-[16px] font-bold tracking-tight text-ink">
          RatioLog
        </span>
      </Link>
      <div className="flex items-center gap-2.5">
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="RatioLog on GitHub"
          className="flex size-8 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:text-white"
        >
          <GithubIcon className="size-[18px]" />
        </a>
        <Link
          href="/login"
          className="rounded-lg border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-[13px] font-medium text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
        >
          Sign in
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div className="relative">
      <div className="relative mx-auto w-full max-w-[1080px] px-6 pb-20 pt-20 text-center sm:pt-28">
        <h1 className="mx-auto max-w-[16ch] text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-7xl">
          Remember <span className="font-serif italic text-brand">why</span> you
          decided.
        </h1>

        <p className="mx-auto mt-6 max-w-[46ch] text-balance text-base leading-relaxed text-ink-muted sm:text-lg">
          What you chose, why it won, and what it cost &mdash; written down
          before the context fades.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-neutral-200"
          >
            Start your decision log
            <ArrowRight
              className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
          <Link
            href="#how"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          >
            See how it works
          </Link>
        </div>

        <div className="mt-16 sm:mt-24">
          <CssMockup />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo size={18} />
          <span className="text-[13px] font-bold tracking-tight text-zinc-300">
            RatioLog
          </span>

          
        </div>
        <p className="text-xs text-zinc-600">&copy; {new Date().getFullYear()} RatioLog</p>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <main className="app-shell relative min-h-dvh overflow-x-clip text-ink">
      {/* page-level light field — one continuous glow behind nav + hero, no seam */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[min(1000px,120vw)] -translate-x-1/2 -translate-y-1/4 rounded-full bg-brand/[0.05] blur-[120px]"
      />
      {/* ghost typography — outlined, subtle; cropped by the viewport top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-6 select-none whitespace-nowrap text-center font-mono text-[42vw] font-bold leading-none tracking-tighter text-transparent sm:-top-14 sm:text-[300px]"
        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.07)" }}
      >
        WHY?
      </div>

      <Nav />
      <Hero />
      <Features />
      <HowItWorks />
      <CallToAction />
      <Footer />
    </main>
  );
}
