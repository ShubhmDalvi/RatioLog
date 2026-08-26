import "server-only";

import { cache } from "react";
import type { Prisma, Decision } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

import { parseTags, safeParseTags } from "./decisions/tags";
import { DECISION_STATUSES, type DecisionStatus } from "./decisions/status";
import type { DecisionFormInput } from "./decisions/validation";

export type DecisionListItem = Decision & {
  createdBy: { name: string | null; email: string };
  pinnedBy: { userId: string }[];
};

export type DecisionOption = {
  id: string;
  title: string;
  status: Decision["status"];
  date: Date;
};

export type RelatedDecision = {
  id: string;
  title: string;
  status: Decision["status"];
};

type RelatedWithAccess = RelatedDecision & {
  createdById: string;
};

export type DecisionDetail = Decision & {
  createdBy: { name: string | null; email: string };
  supersededBy: RelatedDecision | null;
  supersedes: RelatedDecision | null;
};

/**
 * Decisions belong to a single user space: only records created by the
 * current user are ever visible. Fails closed when `userId` is undefined.
 */
function visibleWhere(userId: string | undefined): Prisma.DecisionWhereInput {
  return { createdById: userId ?? "__no_user__" };
}

function pickRelated(
  related: RelatedWithAccess | null,
  userId: string | undefined,
): RelatedDecision | null {
  if (!related || related.createdById !== userId) {
    return null;
  }
  return { id: related.id, title: related.title, status: related.status };
}

export async function listDecisions(
  where: Prisma.DecisionWhereInput = {},
  userId?: string,
  pagination?: { take?: number; skip?: number },
): Promise<DecisionListItem[]> {
  return prisma.decision.findMany({
    where: { AND: [visibleWhere(userId), where] },
    include: {
      createdBy: {
        select: { name: true, email: true },
      },
      pinnedBy: { where: { userId: userId ?? "__no_user__" } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: pagination?.take,
    skip: pagination?.skip,
  });
}

/** Count visible decisions matching the given filter (for pagination). */
export async function countDecisions(
  where: Prisma.DecisionWhereInput = {},
  userId?: string,
): Promise<number> {
  return prisma.decision.count({
    where: { AND: [visibleWhere(userId), where] },
  });
}

export type DecisionStats = {
  total: number;
  byStatus: Record<DecisionStatus, number>;
  lastActivityAt: Date | null;
};

/** Aggregate counts for the living header + status filter chips. */
export async function getDecisionStats(
  userId: string,
): Promise<DecisionStats> {
  const [rows, activity] = await Promise.all([
    prisma.decision.groupBy({
      by: ["status"],
      where: visibleWhere(userId),
      _count: { _all: true },
      _max: { updatedAt: true },
    }),
    prisma.changelogEntry.aggregate({
      where: { createdById: userId },
      _max: { createdAt: true },
    }),
  ]);

  const byStatus = Object.fromEntries(
    DECISION_STATUSES.map((status) => [status, 0]),
  ) as Record<DecisionStatus, number>;

  let total = 0;
  let lastActivityAt: Date | null = activity._max.createdAt ?? null;
  for (const row of rows) {
    const count = row._count._all;
    byStatus[row.status] = count;
    total += count;
    const d = row._max.updatedAt;
    if (d && (!lastActivityAt || d > lastActivityAt)) {
      lastActivityAt = d;
    }
  }

  return { total, byStatus, lastActivityAt };
}

/**
 * Per-status counts for the filter chips. Respects `q`/`tag` so the numbers
 * always describe the current result set, but ignores the status filter.
 */
export async function countDecisionsByStatus(
  where: Prisma.DecisionWhereInput,
  userId?: string,
): Promise<Record<DecisionStatus, number>> {
  const rows = await prisma.decision.groupBy({
    by: ["status"],
    where: { AND: [visibleWhere(userId), where] },
    _count: { _all: true },
  });

  const byStatus = Object.fromEntries(
    DECISION_STATUSES.map((status) => [status, 0]),
  ) as Record<DecisionStatus, number>;
  for (const row of rows) {
    byStatus[row.status] = row._count._all;
  }
  return byStatus;
}

/** All visible decisions as lightweight options (Supersedes select, ⌘K). */
export const listDecisionOptions = cache(async (
  userId?: string,
): Promise<DecisionOption[]> => {
  return prisma.decision.findMany({
    where: visibleWhere(userId),
    select: { id: true, title: true, status: true, date: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
});

/** Distinct, sorted tags across visible decisions, for the tag filter. */
export const getAllTags = cache(async (userId?: string): Promise<string[]> => {
  const rows = await prisma.decision.findMany({
    where: visibleWhere(userId),
    select: { tags: true },
  });
  const tags = new Set<string>();
  for (const row of rows) {
    for (const tag of safeParseTags(row.tags)) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort((a, b) => a.localeCompare(b));
});

export async function getDecisionById(
  id: string,
  userId?: string,
): Promise<DecisionDetail | null> {
  const decision = await prisma.decision.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { name: true, email: true },
      },
      supersededBy: {
        select: { id: true, title: true, status: true, createdById: true },
      },
      supersedes: {
        select: { id: true, title: true, status: true, createdById: true },
      },
    },
  });

  if (!decision || decision.createdById !== userId) {
    return null;
  }

  return {
    ...decision,
    supersededBy: pickRelated(decision.supersededBy, userId),
    supersedes: pickRelated(decision.supersedes, userId),
  };
}

/** Lightweight access info used to guard mutations on decisions. */
export async function getDecisionAccess(
  id: string,
): Promise<{ createdById: string; supersededById: string | null } | null> {
  return prisma.decision.findUnique({
    where: { id },
    select: { createdById: true, supersededById: true },
  });
}

export type DecisionEventInfo = {
  title: string;
  decision: string;
  status: Decision["status"];
  supersedes: { id: string; title: string } | null;
};

/** Snapshot used to build changelog entries from decision lifecycle events. */
export async function getDecisionEventInfo(
  id: string,
): Promise<DecisionEventInfo | null> {
  return prisma.decision.findUnique({
    where: { id },
    select: {
      title: true,
      decision: true,
      status: true,
      supersedes: { select: { id: true, title: true } },
    },
  });
}

function toDateValue(dateInput: string): Date {
  return new Date(`${dateInput}T00:00:00`);
}

function toSupersedesId(id: string, supersedesId: string): string | null {
  if (!supersedesId.trim() || supersedesId === id) {
    return null;
  }
  return supersedesId;
}

export async function createDecision(
  input: DecisionFormInput,
  createdById: string,
): Promise<Decision> {
  const supersedesId = toSupersedesId("", input.supersedesId);

  return prisma.$transaction(async (tx) => {
    const decision = await tx.decision.create({
      data: {
        title: input.title,
        status: input.status as Decision["status"],
        date: toDateValue(input.date),
        context: input.context,
        decision: input.decision,
        consequences: input.consequences,
        tags: JSON.stringify(parseTags(input.tags)),
        createdById,
      },
    });

    if (supersedesId) {
      await tx.decision.update({
        where: { id: supersedesId },
        data: { supersededById: decision.id },
      });
    }

    return decision;
  });
}

export async function updateDecision(
  id: string,
  input: DecisionFormInput,
): Promise<Decision> {
  const supersedesId = toSupersedesId(id, input.supersedesId);

  return prisma.$transaction(async (tx) => {
    const decision = await tx.decision.update({
      where: { id },
      data: {
        title: input.title,
        status: input.status as Decision["status"],
        date: toDateValue(input.date),
        context: input.context,
        decision: input.decision,
        consequences: input.consequences,
        tags: JSON.stringify(parseTags(input.tags)),
      },
    });

    // Drop any previous "X supersedes Y" link for this decision, then (re)link.
    await tx.decision.updateMany({
      where: { supersededById: id },
      data: { supersededById: null },
    });

    if (supersedesId) {
      await tx.decision.update({
        where: { id: supersedesId },
        data: { supersededById: id },
      });
    }

    return decision;
  });
}

export async function updateDecisionStatus(
  id: string,
  status: Decision["status"],
): Promise<Decision> {
  return prisma.decision.update({
    where: { id },
    data: { status },
  });
}

export async function deleteDecision(id: string): Promise<void> {
  await prisma.decision.delete({ where: { id } });
}

/** The current user's pinned decisions. */
export async function listPinnedDecisions(
  userId: string,
): Promise<{ id: string; title: string }[]> {
  const rows = await prisma.pinnedDecision.findMany({
    where: { userId, decision: visibleWhere(userId) },
    select: { decision: { select: { id: true, title: true } } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => row.decision);
}

export async function isDecisionPinned(
  userId: string,
  decisionId: string,
): Promise<boolean> {
  const row = await prisma.pinnedDecision.findUnique({
    where: { userId_decisionId: { userId, decisionId } },
    select: { id: true },
  });
  return row !== null;
}

/** Toggle a pin for a specific user. Returns the new pinned state. */
export async function toggleDecisionPin(
  userId: string,
  decisionId: string,
): Promise<boolean> {
  const existing = await prisma.pinnedDecision.findUnique({
    where: { userId_decisionId: { userId, decisionId } },
  });

  if (existing) {
    await prisma.pinnedDecision.delete({ where: { id: existing.id } });
    return false;
  }

  await prisma.pinnedDecision.create({ data: { userId, decisionId } });
  return true;
}
