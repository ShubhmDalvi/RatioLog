"use server";

import { z } from "zod";

import { auth, signOut } from "@/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { flattenFieldErrors } from "@/lib/decisions/validation";

export type SettingsResult =
  | { ok: true }
  | {
      ok: false;
      fieldErrors?: Record<string, string[] | undefined>;
      error?: string;
    };

const nameSchema = z.object({
  name: z.string().trim().max(80, "Name must be under 80 characters."),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function updateNameAction(
  formData: FormData,
): Promise<SettingsResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }

  const parsed = nameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name || null },
  });

  return { ok: true };
}

export async function changePasswordAction(
  formData: FormData,
): Promise<SettingsResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }

  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user) {
    return { ok: false, error: "Account not found." };
  }

  const currentIsValid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!currentIsValid) {
    return { ok: false, error: "Current password is incorrect." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return { ok: true };
}

/**
 * Permanently delete the signed-in user's account and everything they
 * created: their decisions, changelog entries and pins (both their own and
 * pins that other users placed on their decisions). Supersedes links pointing
 * at the deleted decisions are cleared first to satisfy the foreign keys.
 */
export async function deleteAccountAction(): Promise<{ ok: boolean }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return { ok: false };
  }

  const myDecisionIds = (
    await prisma.decision.findMany({
      where: { createdById: userId },
      select: { id: true },
    })
  ).map((decision) => decision.id);

  await prisma.$transaction([
    prisma.pinnedDecision.deleteMany({
      where: {
        OR: [{ userId }, { decisionId: { in: myDecisionIds } }],
      },
    }),
    prisma.decision.updateMany({
      where: { supersededById: { in: myDecisionIds } },
      data: { supersededById: null },
    }),
    prisma.changelogEntry.deleteMany({ where: { createdById: userId } }),
    prisma.decision.deleteMany({ where: { createdById: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  await signOut({ redirectTo: "/login" });
  return { ok: true };
}
