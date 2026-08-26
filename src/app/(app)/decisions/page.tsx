import { formatDistanceToNow } from "date-fns";
import { Files, Plus, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { DecisionFormSheet } from "@/components/decisions/decision-form-sheet";
import { DecisionToolbar } from "@/components/decisions/decision-toolbar";
import { InfiniteDecisionList } from "@/components/decisions/infinite-decision-list";
import { NewDecisionButton } from "@/components/decisions/new-decision-button";
import {
  countDecisions,
  countDecisionsByStatus,
  getAllTags,
  getDecisionStats,
  listDecisionOptions,
  listDecisions,
} from "@/lib/decisions";
import { DECISION_TEMPLATES } from "@/lib/decisions/templates";
import { DECISIONS_PAGE_SIZE } from "@/lib/decisions/pagination";
import { buildDecisionWhere, normalizeStatus } from "@/lib/decisions/query";

export const metadata: Metadata = {
  title: "Decisions",
};

type SearchParams = {
  q?: string | string[];
  status?: string | string[];
  tag?: string | string[];
  new?: string | string[];
};

export default async function DecisionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return null;
  }

  const q = typeof params.q === "string" ? params.q : undefined;
  const status = normalizeStatus(
    typeof params.status === "string" ? params.status : undefined,
  );
  const tag =
    typeof params.tag === "string" && params.tag.trim() ? params.tag.trim() : undefined;

  const filterWhere = buildDecisionWhere({ q, tag });

  const [decisions, allTags, options, stats, statusCounts] = await Promise.all([
    listDecisions(buildDecisionWhere({ q, status, tag }), userId, {
      take: DECISIONS_PAGE_SIZE,
    }),
    getAllTags(userId),
    listDecisionOptions(userId),
    getDecisionStats(userId),
    countDecisionsByStatus(filterWhere, userId),
  ]);

  // Without a status filter the filtered total is just the chip-count sum —
  // skip the extra query. With one, the chips ignore status, so count for real.
  const statusTotal = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const total = status
    ? await countDecisions(buildDecisionWhere({ q, status, tag }), userId)
    : statusTotal;

  const hasFilters = Boolean(q?.trim() || status || tag);

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Decisions
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Architecture decision records for your project.
          </p>
          {stats.total > 0 ? (
            <p className="mt-2.5 font-mono text-[11px] tracking-[0.04em] text-zinc-500">
              {stats.total} {stats.total === 1 ? "decision" : "decisions"}
              {stats.byStatus.PROPOSED > 0
                ? ` · ${stats.byStatus.PROPOSED} proposed`
                : ""}
              {stats.latestDate
                ? ` · last entry ${formatDistanceToNow(stats.latestDate, {
                    addSuffix: true,
                  })}`
                : ""}
            </p>
          ) : null}
        </div>
        <DecisionFormSheet
          mode="create"
          openParam="new"
          decisions={options}
          tags={allTags}
          userId={userId}
          trigger={
            <Button>
              <Plus className="size-4" />
              New Decision
            </Button>
          }
        />
      </header>

      <DecisionToolbar
        tags={allTags}
        statusCounts={{ all: statusCounts ? Object.values(statusCounts).reduce((a, b) => a + b, 0) : 0, ...statusCounts }}
      />

      {decisions.length === 0 ? (
        hasFilters ? (
          <EmptyState
            icon={<SearchX className="size-5" strokeWidth={1.75} />}
            title="No Matching Decisions"
            description="Try a different search term, status or tag."
            action={
              <Button variant="outline" asChild>
                <Link href="/decisions">Clear Filters</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Files className="size-5" strokeWidth={1.75} />}
            title="No Decisions Yet"
            description="Record the first architecture decision for your project — it only takes a minute."
            action={
              <div className="flex flex-col items-center gap-4">
                <NewDecisionButton>Create Your First Decision</NewDecisionButton>
                <div className="flex flex-col items-center gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-zinc-600">
                    or start from a template
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {DECISION_TEMPLATES.map((template) => (
                      <Link
                        key={template.id}
                        href={`/decisions?new=1&t=${template.id}`}
                        className="group inline-flex items-baseline gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 transition-colors hover:border-white/[0.18] hover:bg-white/[0.06]"
                      >
                        <span className="text-xs font-medium text-zinc-300 transition-colors group-hover:text-white">
                          {template.label}
                        </span>
                        <span className="hidden text-[11px] text-ink-faint sm:inline">
                          {template.hint}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            }
          />
        )
      ) : (
        <div>
          <p className="mb-3 text-xs font-medium text-ink-faint">
            {total} {total === 1 ? "decision" : "decisions"}
          </p>
          <InfiniteDecisionList
            key={`${q ?? ""}|${status ?? ""}|${tag ?? ""}`}
            initialDecisions={decisions}
            total={total}
            q={q}
            status={status}
            tag={tag}
          />
        </div>
      )}
    </div>
  );
}
