import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cache } from "react";

import { authConfig } from "@/auth.config";
import { credentialsSchema } from "@/lib/auth/credentials";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

const nextAuth = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // Re-read the display name on every auth() call so profile changes (e.g.
    // the Settings page) show up immediately instead of waiting for re-login.
    session: async ({ session, token }) => {
      if (session.user && token.id) {
        session.user.id = token.id;
        const user = await prisma.user.findUnique({
          where: { id: token.id },
          select: { name: true },
        });
        if (user) {
          session.user.name = user.name;
        }
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
});

// `auth()` is called in the layout and again in every page within the same
// render request; memoize per request so the user lookup runs once.
export const auth = cache(nextAuth.auth);

export const { handlers, signIn, signOut } = nextAuth;
