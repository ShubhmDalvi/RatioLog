"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { Prisma } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/auth/credentials";
import { prisma } from "@/lib/prisma";

export type LoginState = { error?: string } | undefined;

export type SignupState = {
  fieldErrors?: Record<string, string[] | undefined>;
  error?: string;
} | undefined;

export async function loginAction(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/decisions",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }
}

export async function signupAction(
  _previous: SignupState,
  formData: FormData,
): Promise<SignupState> {
  if (process.env.ALLOW_SIGNUP === "false") {
    return { error: "New signups are currently closed." };
  }

  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      fieldErrors: {
        email: ["An account with this email already exists."],
      },
    };
  }

  const passwordHash = await hashPassword(password);
  try {
    await prisma.user.create({
      data: { email, name: name || null, passwordHash },
    });
  } catch (error) {
    // Two simultaneous signups with the same email can race past the
    // existence check above — the unique constraint is the source of truth.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        fieldErrors: {
          email: ["An account with this email already exists."],
        },
      };
    }
    throw error;
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/decisions",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Account created — please sign in with your new credentials.",
      };
    }
    throw error;
  }
}
