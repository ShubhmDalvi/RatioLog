"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

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


const DEBOUNCE_MS = 300;

export type StatusCounts = { all: number } & Record<DecisionStatus, number>;

export function DecisionToolbar({
  tags,
  statusCounts,
}: {
  tags: string[];
  statusCounts?: StatusCounts;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const urlStatus = (searchParams.get("status") ?? "").toUpperCase();
  const urlTag = searchParams.get("tag") ?? "";

  const [query, setQuery] = useState(urlQuery);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setIsMac(/Mac|iPhone|iPad/.test(navigator.platform)));
  }, []);

  useEffect(() => {
    if (query === urlQuery) {
      return;
    }
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, urlQuery, pathname, searchParams, router, startTransition]);

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  const setStatus = (status: DecisionStatus | undefined) => {
    updateParams((params) => {
      if (status) {
        params.set("status", status);
      } else {
        params.delete("status");
      }
    });
  };

  const setTag = (tag: string) => {
    updateParams((params) => {
      if (tag) {
        params.set("tag", tag);
      } else {
        params.delete("tag");
      }
    });
  };

  const hasFilters = Boolean(query.trim() || urlStatus || urlTag);

  const clearFilters = () => {
    setQuery("");
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-colors focus-within:border-white/20">
        <Search className="size-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search decisions…"
          aria-label="Search decisions"
          className="h-9 w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
        />
        <button
          type="button"
          aria-label="Open command palette"
          onClick={() => window.dispatchEvent(new Event("ratiolog:open-search"))}
          className="hidden shrink-0 items-center gap-1 rounded border border-white/[0.10] bg-white/[0.05] px-2 py-1 font-mono text-[11px] leading-none text-zinc-400 transition-colors hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-zinc-200 sm:inline-flex"
        >
          {isMac ? (
            <>
              <span className="font-sans text-[13px] leading-none">⌘</span>
              <span>K</span>
            </>
          ) : (
            <>Ctrl K</>
          )}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Filter by status">
          <button
            type="button"
            onClick={() => setStatus(undefined)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
              urlStatus === ""
                ? "border-white/[0.1] bg-white/[0.1] text-white"
                : "border-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            All
            {statusCounts ? (
              <span className="ml-2 font-mono text-[10px] tabular-nums text-zinc-500">
                {statusCounts.all}
              </span>
            ) : null}
          </button>
          {DECISION_STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatus(status)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                urlStatus === status
                  ? "border-white/[0.1] bg-white/[0.1] text-white"
                  : "border-transparent text-zinc-400 hover:bg-white/[0.06] hover:text-white",
                statusCounts && statusCounts[status] === 0 && urlStatus !== status
                  ? "opacity-50"
                  : "",
              )}
            >
              {STATUS_LABELS[status]}
              {statusCounts ? (
                <span className="ml-2 font-mono text-[10px] tabular-nums text-zinc-500">
                  {statusCounts[status]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {tags.length > 0 ? (
          <Select
            value={urlTag || undefined}
            onValueChange={(value) => setTag(value === "__none__" ? "" : value)}
          >
            <SelectTrigger className="h-7 w-auto gap-1.5 rounded-md border-none px-2.5 text-xs font-medium text-zinc-400 shadow-none hover:bg-white/[0.06] hover:text-white data-[placeholder]:text-zinc-400">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="__none__">All Tags</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md px-2 py-1 text-xs font-medium text-brand hover:bg-white/[0.06]"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
