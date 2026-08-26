"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import type { ChangelogEntryType } from "@/lib/changelog";
import { logDecisionEvent } from "@/lib/changelog";
import {
  countDecisions,
  createDecision,
  deleteDecision,
  getDecisionAccess,
  getDecisionEventInfo,
  listDecisions,
  toggleDecisionPin,
  updateDecision,
  updateDecisionStatus,
  type DecisionListItem,
} from "@/lib/decisions";
import { DECISIONS_PAGE_SIZE } from "@/lib/decisions/pagination";
import { buildDecisionWhere, normalizeStatus } from "@/lib/decisions/query";
import { DECISION_STATUSES, STATUS_LABELS } from "@/lib/decisions/status";
import type { DecisionStatus } from "@/lib/decisions/status";
import {
  decisionFormSchema,
  flattenFieldErrors,
} from "@/lib/decisions/validation";

export type DecisionFormResult =
  | { ok: true; id: string }
  | {
      ok: false;
      fieldErrors?: Record<string, string[] | undefined>;
      error?: string;
    };

async function canModifyDecision(
  id: string,
  userId: string,
): Promise<boolean> {
  const access = await getDecisionAccess(id);
  if (!access) {
    return false;
  }
  return access.createdById === userId;
}

/**
 * Validate the supersedes target: it must exist, belong to the current user
 * (the public combobox only offers their own, but the server re-checks), and
 * not already be superseded by another decision. `currentId` is set when
 * editing, so re-saving an existing link stays allowed.
 */
export async function validateSupersedes(
  supersedesId: string,
  userId: string,
  currentId?: string,
): Promise<string | null> {
  if (!supersedesId.trim()) {
    return null;
  }
  const target = await getDecisionAccess(supersedesId);
  if (!target) {
    return "Choose a valid decision.";
  }
  if (target.createdById !== userId) {
    return "You can only supersede your own decisions.";
  }
  if (target.supersededById && target.supersededById !== currentId) {
    return "That decision is already superseded by another one.";
  }
  if (currentId) {
    // A decision that is itself superseded can't supersede another — this
    // also blocks A⇄B mutual cycles (A superseded by B, then A supersedes B).
    const own = await getDecisionAccess(currentId);
    if (own?.supersededById) {
      return "This decision is already superseded — it can't supersede another one.";
    }
  }
  return null;
}

function statusEventType(status: DecisionStatus): ChangelogEntryType {
  switch (status) {
    case "ACCEPTED":
      return "ADDED";
    case "DEPRECATED":
      return "DEPRECATED";
    case "SUPERSEDED":
    case "REJECTED":
      return "REMOVED";
    default:
      return "CHANGED";
  }
}

export async function createDecisionAction(
  formData: FormData,
): Promise<DecisionFormResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to create a decision." };
  }

  const parsed = decisionFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const supersedesError = await validateSupersedes(
    parsed.data.supersedesId,
    session.user.id,
  );
  if (supersedesError) {
    return {
      ok: false,
      fieldErrors: { supersedesId: [supersedesError] },
    };
  }

  const decision = await createDecision(parsed.data, session.user.id);

  // Every decision is logged the moment it is recorded.
  const info = await getDecisionEventInfo(decision.id);
  if (info) {
    const supersedeNote = info.supersedes
      ? `\n\nSupersedes: ${info.supersedes.title}`
      : "";
    await logDecisionEvent({
      decisionId: decision.id,
      source: "DECISION_PUBLISHED",
      type: "ADDED",
      title: info.title,
      description: `${info.decision}${supersedeNote}`.trim(),
      createdById: session.user.id,
    });
  }

  revalidatePath("/decisions");
  revalidatePath("/changelog");
  return { ok: true, id: decision.id };
}

export async function updateDecisionAction(
  formData: FormData,
): Promise<DecisionFormResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to update a decision." };
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false, error: "Invalid request." };
  }

  const access = await getDecisionAccess(id);
  if (!access) {
    return { ok: false, error: "This decision could not be found." };
  }
  if (access.createdById !== session.user.id) {
    return {
      ok: false,
      error: "You don't have permission to edit this decision.",
    };
  }

  const parsed = decisionFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const supersedesError = await validateSupersedes(
    parsed.data.supersedesId,
    session.user.id,
    id,
  );
  if (supersedesError) {
    return {
      ok: false,
      fieldErrors: { supersedesId: [supersedesError] },
    };
  }

  try {
    await updateDecision(id, parsed.data);
  } catch {
    return { ok: false, error: "This decision could not be found." };
  }

  // Log the change.
  const info = await getDecisionEventInfo(id);
  if (info) {
    const supersedeNote = info.supersedes
      ? `\n\nSupersedes: ${info.supersedes.title}`
      : "";
    await logDecisionEvent({
      decisionId: id,
      source: "DECISION_EDITED",
      type: "CHANGED",
      title: `${info.title} updated`,
      description: `${info.decision}${supersedeNote}`.trim(),
      createdById: session.user.id,
    });
  }

  revalidatePath("/decisions");
  revalidatePath(`/decisions/${id}`);
  revalidatePath("/changelog");
  return { ok: true, id };
}

export async function changeStatusAction(
  formData: FormData,
): Promise<{ ok: boolean; status?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false };
  }

  const id = formData.get("id");
  const status = formData.get("status");
  if (typeof id !== "string" || typeof status !== "string") {
    return { ok: false };
  }

  if (!(await canModifyDecision(id, session.user.id))) {
    return { ok: false };
  }

  const parsedStatus = z.enum(DECISION_STATUSES).safeParse(status);
  if (!parsedStatus.success) {
    return { ok: false };
  }

  const before = await getDecisionEventInfo(id);
  if (!before || before.status === parsedStatus.data) {
    return { ok: false };
  }

  await updateDecisionStatus(id, parsedStatus.data);

  await logDecisionEvent({
    decisionId: id,
    source: "DECISION_STATUS_CHANGED",
    type: statusEventType(parsedStatus.data),
    title: `${before.title} → ${STATUS_LABELS[parsedStatus.data]}`,
    createdById: session.user.id,
  });

  revalidatePath(`/decisions/${id}`);
  revalidatePath("/changelog");
  return { ok: true, status: parsedStatus.data };
}

export async function deleteDecisionAction(
  formData: FormData,
): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false };
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false };
  }

  if (!(await canModifyDecision(id, session.user.id))) {
    return { ok: false };
  }

  const before = await getDecisionEventInfo(id);

  // Log before deleting: the entry references the decision, and deleting it
  // first would violate the FK. Created first, the link is SetNull'd by the
  // delete and the "removed" entry survives, unlinked.
  if (before) {
    await logDecisionEvent({
      decisionId: id,
      source: "DECISION_REMOVED",
      type: "REMOVED",
      title: `${before.title} removed`,
      createdById: session.user.id,
    });
  }

  await deleteDecision(id);

  revalidatePath("/decisions");
  revalidatePath("/changelog");
  return { ok: true };
}

export async function togglePinAction(
  formData: FormData,
): Promise<{ ok: boolean; pinned: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, pinned: false };
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false, pinned: false };
  }

  const access = await getDecisionAccess(id);
  if (!access || access.createdById !== session.user.id) {
    return { ok: false, pinned: false };
  }

  const pinned = await toggleDecisionPin(session.user.id, id);

  revalidatePath("/decisions");
  revalidatePath(`/decisions/${id}`);
  return { ok: true, pinned };
}

export type LoadMoreResult = {
  ok: boolean;
  decisions: DecisionListItem[];
  hasMore: boolean;
};

export async function loadMoreDecisionsAction(
  formData: FormData,
): Promise<LoadMoreResult> {
  const session = await auth();
  const userId = session?.user?.id;

  const q = formData.get("q");
  const status = formData.get("status");
  const tag = formData.get("tag");
  const rawSkip = formData.get("skip");

  const skip = Number(rawSkip);
  if (!Number.isInteger(skip) || skip < 0) {
    return { ok: false, decisions: [], hasMore: false };
  }

  const where = buildDecisionWhere({
    q: typeof q === "string" ? q : undefined,
    status: normalizeStatus(typeof status === "string" ? status : undefined),
    tag: typeof tag === "string" ? tag : undefined,
  });

  const [decisions, total] = await Promise.all([
    listDecisions(where, userId, { take: DECISIONS_PAGE_SIZE, skip }),
    countDecisions(where, userId),
  ]);

  return {
    ok: true,
    decisions,
    hasMore: skip + decisions.length < total,
  };
}
