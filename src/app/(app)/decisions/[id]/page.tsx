import { format } from "date-fns";
import { ArrowLeft, GitFork, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ChangeStatusMenu } from "@/components/decisions/change-status-menu";
import { CopyLinkButton } from "@/components/decisions/copy-link-button";
import { DeleteDecisionButton } from "@/components/decisions/delete-decision-button";
import { DecisionFormSheet } from "@/components/decisions/decision-form-sheet";
import { DraftTag } from "@/components/decisions/draft-tag";
import { PinButton } from "@/components/decisions/pin-button";
import { PublishButton } from "@/components/decisions/publish-button";
import { StatusBadge } from "@/components/decisions/status-badge";
import { ToolbarButton } from "@/components/decisions/toolbar-button";
import { Markdown } from "@/components/markdown";
import { TagChip } from "@/components/tag-chip";
import {
  getAllTags,
  getDecisionById,
  isDecisionPinned,
  listDecisionOptions,
} from "@/lib/decisions";
import { safeParseTags } from "@/lib/decisions/tags";
import type { DecisionStatus } from "@/lib/decisions/status";

type Params = { id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  const decision = await getDecisionById(id);
  return { title: decision?.title ?? "Decision" };
}

function DocumentSection({
  label,
  content,
}: {
  label: string;
  content: string;
}) {
  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
        {label}
      </h2>
      {content.trim() ? (
        <Markdown content={content} />
      ) : (
        <p className="text-sm italic text-ink-faint">Not provided.</p>
      )}
    </section>
  );
}

export default async function DecisionDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const [decision, decisions, availableTags, pinned] = await Promise.all([
    getDecisionById(id, userId),
    listDecisionOptions(userId),
    getAllTags(userId),
    userId ? isDecisionPinned(userId, id) : Promise.resolve(false),
  ]);

  if (!decision) {
    notFound();
  }

  const author = decision.createdBy.name ?? decision.createdBy.email;
  const tags = safeParseTags(decision.tags);
  const isCreator = decision.createdById === userId;
  const hasRelated =
    decision.supersedes !== null || decision.supersededBy !== null;

  const related: { direction: "supersedes" | "supersededBy"; id: string; title: string; status: DecisionStatus }[] = [];
  if (decision.supersedes) {
    related.push({
      direction: "supersedes",
      ...decision.supersedes,
    });
  }
  if (decision.supersededBy) {
    related.push({
      direction: "supersededBy",
      ...decision.supersededBy,
    });
  }

  return (
    <article className="mx-auto max-w-[720px]">
      <Link
        href="/decisions"
        className="mb-8 inline-flex items-center gap-1.5 text-sm text-ink-faint transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Decisions
      </Link>

      <div className="sticky top-14 z-10 -mx-5 flex items-center justify-between gap-2 border-b border-white/[0.08] bg-[#141417]/85 px-5 py-2.5 backdrop-blur-md max-sm:flex-wrap sm:-mx-8 sm:px-8 lg:top-0 lg:-mx-10 lg:px-10">
        <div className="flex items-center gap-2">
          {isCreator ? (
            <ChangeStatusMenu id={decision.id} current={decision.status} />
          ) : (
            <StatusBadge status={decision.status} />
          )}
          {decision.isPrivate ? <DraftTag /> : null}
        </div>
        <div className="flex items-center gap-1">
          {isCreator ? (
            <>
              {decision.isPrivate ? (
                <PublishButton id={decision.id} />
              ) : null}
              <DecisionFormSheet
                mode="edit"
                openParam="edit"
                trigger={
                  <ToolbarButton aria-label="Edit" title="Edit">
                    <Pencil className="size-3.5" />
                    <span className="hidden sm:inline">Edit</span>
                  </ToolbarButton>
                }
                decision={{
                  id: decision.id,
                  title: decision.title,
                  status: decision.status,
                  date: decision.date,
                  isPrivate: decision.isPrivate,
                  tags,
                  context: decision.context,
                  decision: decision.decision,
                  consequences: decision.consequences,
                  supersedesId: decision.supersedes?.id ?? null,
                }}
                decisions={decisions}
                tags={availableTags}
              />
              <DeleteDecisionButton id={decision.id} />
              </>
            ) : null}
            <CopyLinkButton />
            <PinButton id={decision.id} pinned={pinned} />
          </div>
        </div>

      <header className="border-b border-line pb-8">
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-ink">
          {decision.title}
        </h1>

        <div className="mt-3 flex items-center gap-2 text-sm text-ink-muted">
          <span>{format(decision.date, "MMMM d, yyyy")}</span>
          <span aria-hidden="true">·</span>
          <span>{author}</span>
        </div>

        {tags.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <li key={tag}>
                <TagChip>{tag}</TagChip>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="mt-8 space-y-9">
        <DocumentSection label="Context" content={decision.context} />

        <section>
          <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
            Decision
          </h2>
          {decision.decision.trim() ? (
            <div className="font-medium text-ink">
              <Markdown content={decision.decision} />
            </div>
          ) : (
            <p className="text-sm italic text-ink-faint">Not provided.</p>
          )}
        </section>

        <DocumentSection label="Consequences" content={decision.consequences} />

        {hasRelated ? (
          <section>
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-muted">
              Related Decisions
            </h2>
            <div className="space-y-2.5">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/decisions/${item.id}`}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#141417] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all duration-200 hover:-translate-y-px hover:border-white/[0.15] hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
                >
                  <GitFork className="size-4 shrink-0 text-ink-faint" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-ink-faint">
                      {item.direction === "supersedes" ? "Supersedes" : "Superseded By"}
                    </span>
                    <span className="block truncate text-sm font-medium text-ink">
                      {item.title}
                    </span>
                  </span>
                  <StatusBadge status={item.status} />
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
