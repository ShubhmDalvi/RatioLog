import { format } from "date-fns";
import { History, Plus } from "lucide-react";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { ChangelogEntryCard } from "@/components/changelog/changelog-entry-card";
import { ChangelogEntrySheet } from "@/components/changelog/changelog-entry-sheet";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
  listChangelogEntries,
  type ChangelogEntryWithAuthor,
} from "@/lib/changelog";
import { CHANGELOG_TYPE_DOT_STYLES } from "@/lib/changelog/status";
import { listDecisionOptions } from "@/lib/decisions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Changelog",
};

export default async function ChangelogPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [entries, decisions] = await Promise.all([
    listChangelogEntries(),
    listDecisionOptions(userId),
  ]);

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
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
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

      {grouped.length === 0 ? (
        <EmptyState
          icon={<History className="size-5" strokeWidth={1.75} />}
          title="No Changelog Entries Yet"
          description="Publishing a decision adds an entry automatically, or create one manually."
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                {group.label}
              </h2>
              <ol className="relative space-y-4 border-l border-white/[0.06] pl-6">
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
