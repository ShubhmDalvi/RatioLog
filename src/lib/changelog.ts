import "server-only";

import type { ChangelogEntry } from "@/generated/prisma/client";
import { CHANGELOG_TYPES, type ChangelogType } from "@/lib/changelog/status";
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

export async function listChangelogEntries(
  userId: string,
  type?: ChangelogType,
): Promise<ChangelogEntryWithAuthor[]> {
  return prisma.changelogEntry.findMany({
    where: { createdById: userId, type },
    include: {
      createdBy: { select: { name: true, email: true } },
      decision: { select: { id: true, title: true, status: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
}

/** Per-type counts for the filter chips (ignores the active type filter). */
export async function countChangelogEntriesByType(
  userId: string,
): Promise<Record<ChangelogType, number>> {
  const rows = await prisma.changelogEntry.groupBy({
    by: ["type"],
    where: { createdById: userId },
    _count: { _all: true },
  });

  const byType = Object.fromEntries(
    CHANGELOG_TYPES.map((type) => [type, 0]),
  ) as Record<ChangelogType, number>;
  for (const row of rows) {
    byType[row.type] = row._count._all;
  }
  return byType;
}

export async function getChangelogEntry(
  id: string,
  userId?: string,
): Promise<ChangelogEntryWithAuthor | null> {
  const entry = await prisma.changelogEntry.findUnique({
    where: { id },
    include: {
      createdBy: { select: { name: true, email: true } },
      decision: { select: { id: true, title: true, status: true } },
    },
  });

  if (!entry || entry.createdById !== userId) {
    return null;
  }
  return entry;
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
