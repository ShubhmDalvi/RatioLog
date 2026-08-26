import { format } from "date-fns";
import { History, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { ChangelogEntryCard } from "@/components/changelog/changelog-entry-card";
import { ChangelogEntrySheet } from "@/components/changelog/changelog-entry-sheet";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  countChangelogEntriesByType,
  listChangelogEntries,
  type ChangelogEntryWithAuthor,
} from "@/lib/changelog";
import {
  CHANGELOG_TYPES,
  CHANGELOG_TYPE_DOT_STYLES,
  CHANGELOG_TYPE_LABELS,
} from "@/lib/changelog/status";
import type { ChangelogType } from "@/lib/changelog/status";
import { listDecisionOptions } from "@/lib/decisions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Changelog",
};

type SearchParams = {
  type?: string | string[];
};

function normalizeType(raw: string | undefined): ChangelogType | undefined {
  if (!raw) {
    return undefined;
  }
  const upper = raw.toUpperCase();
  return (CHANGELOG_TYPES as readonly string[]).includes(upper)
    ? (upper as ChangelogType)
    : undefined;
}

export default async function ChangelogPage({
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

  const type = normalizeType(
    typeof params.type === "string" ? params.type : undefined,
  );

  const [entries, typeCounts, decisions] = await Promise.all([
    listChangelogEntries(userId, type),
    countChangelogEntriesByType(userId),
    listDecisionOptions(userId),
  ]);

  const totalCount = Object.values(typeCounts).reduce((a, b) => a + b, 0);

  const grouped = entries.reduce<{ label: string; items: ChangelogEntryWithAuthor[] }[]>(
    (groups, entry) => {
      const label = format(entry.date, "MMMM yyyy");
      const last = groups[groups.length - 1];
      if (last && last.label === label) {
        last.items.push(entry);
      } else {
        groups.push({ label, items: [entry] });
      }
      return groups;
    },
    [],
  );

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Changelog
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            A lightweight record of changes across your project.
          </p>
        </div>
        <ChangelogEntrySheet
          mode="create"
          decisions={decisions}
          trigger={
            <Button>
              <Plus className="size-4" />
              New Entry
            </Button>
          }
        />
      </header>

      {totalCount > 0 ? (
        <div
          className="mb-8 flex flex-wrap items-center gap-1"
          role="group"
          aria-label="Filter by type"
        >
          <Link
            href="/changelog"
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              !type
                ? "border border-white/[0.1] bg-white/[0.1] text-white"
                : "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
            )}
          >
            All
            <span className="ml-1.5 font-mono text-[10px] text-zinc-500">
              {totalCount}
            </span>
          </Link>
          {CHANGELOG_TYPES.map((item) => (
            <Link
              key={item}
              href={type === item ? "/changelog" : `/changelog?type=${item}`}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                type === item
                  ? "border border-white/[0.1] bg-white/[0.1] text-white"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white",
                typeCounts[item] === 0 && type !== item ? "opacity-50" : "",
              )}
            >
              {CHANGELOG_TYPE_LABELS[item]}
              <span className="ml-1.5 font-mono text-[10px] text-zinc-500">
                {typeCounts[item]}
              </span>
            </Link>
          ))}
        </div>
      ) : null}

      {grouped.length === 0 ? (
        <EmptyState
          icon={<History className="size-5" strokeWidth={1.75} />}
          title={type ? "No Entries of This Type" : "No Changelog Entries Yet"}
          description={
            type
              ? "Try a different type, or clear the filter."
              : "Every decision you record appears here automatically, or add an entry manually."
          }
          action={
            type ? (
              <Button variant="outline" asChild>
                <Link href="/changelog">Clear Filter</Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.label}>
              <h2 className="sticky top-14 z-10 -mx-5 bg-[#141417]/95 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 backdrop-blur-sm sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-10 lg:px-10">
                {group.label}
              </h2>
              <ol className="relative mt-3 space-y-4 border-l border-white/[0.06] pl-6">
                {group.items.map((entry) => (
                  <li key={entry.id} className="relative">
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -left-[29px] top-1.5 size-2.5 rounded-full ring-4 ring-[#141417]",
                        CHANGELOG_TYPE_DOT_STYLES[entry.type],
                      )}
                    />
                    <ChangelogEntryCard
                      entry={entry}
                      canManage={entry.createdById === userId}
                      decisions={decisions}
                    />
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
