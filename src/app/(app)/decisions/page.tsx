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
  getAllTags,
  listDecisionOptions,
  listDecisions,
} from "@/lib/decisions";
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

  const q = typeof params.q === "string" ? params.q : undefined;
  const status = normalizeStatus(
    typeof params.status === "string" ? params.status : undefined,
  );
  const tag =
    typeof params.tag === "string" && params.tag.trim() ? params.tag.trim() : undefined;

  const [decisions, total, allTags, options] = await Promise.all([
    listDecisions(buildDecisionWhere({ q, status, tag }), userId, {
      take: DECISIONS_PAGE_SIZE,
    }),
    countDecisions(buildDecisionWhere({ q, status, tag }), userId),
    getAllTags(userId),
    listDecisionOptions(userId),
  ]);

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
        </div>
        <DecisionFormSheet
          mode="create"
          openParam="new"
          decisions={options}
          tags={allTags}
          trigger={
            <Button>
              <Plus className="size-4" />
              New Decision
            </Button>
          }
        />
      </header>

      <DecisionToolbar tags={allTags} />

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
              <NewDecisionButton>Create Your First Decision</NewDecisionButton>
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
