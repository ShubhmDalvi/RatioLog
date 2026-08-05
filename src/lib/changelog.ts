import "server-only";

import type { ChangelogEntry } from "@/generated/prisma/client";
import type { DecisionStatus } from "@/lib/decisions/status";
import { prisma } from "@/lib/prisma";

export type ChangelogEntryType = ChangelogEntry["type"];
export type ChangelogEntrySource = ChangelogEntry["source"];

export type ChangelogEntryInput = {
  title: string;
  description: string;
  type: ChangelogEntryType;
  date: Date;
  scope?: string;
  decisionId?: string | null;
};

export type ChangelogEntryWithAuthor = ChangelogEntry & {
  createdBy: { name: string | null; email: string };
  decision: { id: string; title: string; status: DecisionStatus } | null;
};

export async function listChangelogEntries(): Promise<
  ChangelogEntryWithAuthor[]
> {
  return prisma.changelogEntry.findMany({
    include: {
      createdBy: { select: { name: true, email: true } },
      decision: { select: { id: true, title: true, status: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

export async function getChangelogEntry(
  id: string,
): Promise<ChangelogEntryWithAuthor | null> {
  return prisma.changelogEntry.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      decision: { select: { id: true, title: true, status: true } },
    },
  });
}

/** Lightweight access info used to guard edits/deletes on changelog entries. */
export async function getChangelogEntryAccess(
  id: string,
): Promise<{ createdById: string } | null> {
  return prisma.changelogEntry.findUnique({
    where: { id },
    select: { createdById: true },
  });
}

export async function createChangelogEntry(
  input: ChangelogEntryInput,
  createdById: string,
): Promise<ChangelogEntry> {
  return prisma.changelogEntry.create({
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      scope: input.scope ?? "",
      decisionId: input.decisionId || null,
      date: input.date,
      createdById,
    },
  });
}

export async function updateChangelogEntry(
  id: string,
  input: ChangelogEntryInput,
): Promise<ChangelogEntry> {
  return prisma.changelogEntry.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      scope: input.scope ?? "",
      decisionId: input.decisionId || null,
      date: input.date,
    },
  });
}

export async function deleteChangelogEntry(id: string): Promise<void> {
  await prisma.changelogEntry.delete({ where: { id } });
}

/** Create an auto-generated entry for a decision lifecycle event. */
export async function logDecisionEvent({
  decisionId,
  source,
  type,
  title,
  description = "",
  createdById,
}: {
  decisionId: string;
  source: ChangelogEntrySource;
  type: ChangelogEntryType;
  title: string;
  description?: string;
  createdById: string;
}): Promise<ChangelogEntry> {
  return prisma.changelogEntry.create({
    data: {
      title,
      description,
      type,
      source,
      decisionId,
      date: new Date(),
      createdById,
    },
  });
}
