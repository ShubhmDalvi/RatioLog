import "server-only";

import type { Prisma } from "@/generated/prisma/client";

import { DECISION_STATUSES, type DecisionStatus } from "./status";

export type DecisionQuery = {
  q?: string;
  status?: DecisionStatus;
  tag?: string;
};

/**
 * Normalize a raw `status` search param into a valid status value.
 * Returns `undefined` for missing or invalid values.
 */
export function normalizeStatus(
  raw: string | undefined,
): DecisionStatus | undefined {
  if (!raw) {
    return undefined;
  }
  const upper = raw.toUpperCase();
  return (DECISION_STATUSES as readonly string[]).includes(upper)
    ? (upper as DecisionStatus)
    : undefined;
}

/**
 * Build a Prisma `where` clause from the search/filter UI state.
 *
 * `contains` maps to `LIKE` on SQLite (case-insensitive for ASCII) and to
 * `ILIKE` on PostgreSQL, so this is portable. Tags are stored as a JSON
 * array string, so tag matching looks for the quoted element, which keeps
 * exact-ish membership without a join table.
 */
export function buildDecisionWhere({
  q,
  status,
  tag,
}: DecisionQuery): Prisma.DecisionWhereInput {
  const where: Prisma.DecisionWhereInput = {};

  const query = q?.trim();
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { context: { contains: query } },
      { decision: { contains: query } },
      { consequences: { contains: query } },
      { tags: { contains: query } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (tag) {
    where.tags = { contains: `"${tag}"` };
  }

  return where;
}
