"use client";

import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { loadMoreDecisionsAction } from "@/app/(app)/decisions/actions";
import type { DecisionListItem } from "@/lib/decisions";
import { DECISIONS_PAGE_SIZE } from "@/lib/decisions/pagination";

import { DecisionCard } from "./decision-card";

type InfiniteDecisionListProps = {
  initialDecisions: DecisionListItem[];
  total: number;
  q?: string;
  status?: string;
  tag?: string;
};

export function InfiniteDecisionList({
  initialDecisions,
  total,
  q,
  status,
  tag,
}: InfiniteDecisionListProps) {
  const [decisions, setDecisions] = useState(initialDecisions);
  const [hasMore, setHasMore] = useState(initialDecisions.length < total);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const skipRef = useRef(initialDecisions.length);
  const loadingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    setIsLoading(true);
    try {
      const formData = new FormData();
      if (q) {
        formData.set("q", q);
      }
      if (status) {
        formData.set("status", status);
      }
      if (tag) {
        formData.set("tag", tag);
      }
      formData.set("skip", String(skipRef.current));

      const res = await loadMoreDecisionsAction(formData);

      if (res.ok && res.decisions.length > 0) {
        setDecisions((prev) => {
          const seen = new Set(prev.map((decision) => decision.id));
          const fresh = res.decisions.filter(
            (decision) => !seen.has(decision.id),
          );
          return [...prev, ...fresh];
        });
        skipRef.current += res.decisions.length;
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [q, status, tag]);

  useEffect(() => {
    if (!hasMore) {
      return;
    }
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "600px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <>
      <ul className="space-y-3">
        {decisions.map((decision) => (
          <li key={decision.id}>
            <DecisionCard decision={decision} />
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} aria-hidden="true" className="h-px" />

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="size-5 animate-spin text-ink-faint" />
        </div>
      ) : null}

      {!hasMore && decisions.length >= DECISIONS_PAGE_SIZE ? (
        <p className="pt-6 text-center text-xs text-ink-faint">
          You&apos;re all caught up.
        </p>
      ) : null}
    </>
  );
}
