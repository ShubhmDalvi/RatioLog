"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import {
  createChangelogEntry,
  deleteChangelogEntry,
  getChangelogEntryAccess,
  updateChangelogEntry,
} from "@/lib/changelog";
import { CHANGELOG_TYPES } from "@/lib/changelog/status";
import { getDecisionAccess } from "@/lib/decisions";
import { flattenFieldErrors } from "@/lib/decisions/validation";

export type ChangelogResult =
  | { ok: true; id: string }
  | {
      ok: false;
      fieldErrors?: Record<string, string[] | undefined>;
      error?: string;
    };

const changelogSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().max(20000).default(""),
  type: z.enum(CHANGELOG_TYPES),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a date"),
  scope: z.string().trim().max(80, "Scope must be under 80 characters.").default(""),
  decisionId: z.string().trim().max(64).default(""),
});

async function canModifyEntry(
  id: string,
  userId: string,
): Promise<boolean> {
  const entry = await getChangelogEntryAccess(id);
  return entry !== null && entry.createdById === userId;
}

/** Resolve the optional linked decision, validating that it exists. */
async function resolveDecisionId(
  raw: string,
): Promise<{ decisionId: string | null; error?: string }> {
  const id = raw.trim();
  if (!id) {
    return { decisionId: null };
  }
  const access = await getDecisionAccess(id);
  if (!access) {
    return { decisionId: null, error: "Choose a valid decision." };
  }
  return { decisionId: id };
}

export async function createChangelogEntryAction(
  formData: FormData,
): Promise<ChangelogResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to add a changelog entry." };
  }

  const parsed = changelogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const linked = await resolveDecisionId(parsed.data.decisionId);
  if (linked.error) {
    return { ok: false, error: linked.error };
  }

  const entry = await createChangelogEntry(
    {
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      date: new Date(`${parsed.data.date}T00:00:00`),
      scope: parsed.data.scope,
      decisionId: linked.decisionId,
    },
    session.user.id,
  );

  revalidatePath("/changelog");
  return { ok: true, id: entry.id };
}

export async function updateChangelogEntryAction(
  formData: FormData,
): Promise<ChangelogResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to edit a changelog entry." };
  }

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { ok: false, error: "Invalid request." };
  }

  if (!(await canModifyEntry(id, session.user.id))) {
    return {
      ok: false,
      error: "You don't have permission to edit this changelog entry.",
    };
  }

  const parsed = changelogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const linked = await resolveDecisionId(parsed.data.decisionId);
  if (linked.error) {
    return { ok: false, error: linked.error };
  }

  try {
    await updateChangelogEntry(id, {
      title: parsed.data.title,
      description: parsed.data.description,
      type: parsed.data.type,
      date: new Date(`${parsed.data.date}T00:00:00`),
      scope: parsed.data.scope,
      decisionId: linked.decisionId,
    });
  } catch {
    return { ok: false, error: "This changelog entry could not be found." };
  }

  revalidatePath("/changelog");
  return { ok: true, id };
}

export async function deleteChangelogEntryAction(
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

  if (!(await canModifyEntry(id, session.user.id))) {
    return { ok: false };
  }

  try {
    await deleteChangelogEntry(id);
  } catch {
    return { ok: false };
  }

  revalidatePath("/changelog");
  return { ok: true };
}
