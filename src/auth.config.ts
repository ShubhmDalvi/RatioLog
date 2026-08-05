import type { NextAuthConfig } from "next-auth";

const protectedPrefixes = ["/decisions", "/changelog"];

/**
 * Shared Auth.js configuration used by both the app (`auth.ts`) and the
 * proxy (`proxy.ts`). Providers are intentionally kept empty here so the
 * proxy bundle stays lean; the full Credentials provider lives in `auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isProtected = protectedPrefixes.some((prefix) =>
        request.nextUrl.pathname.startsWith(prefix),
      );

      if (isProtected) {
        return isLoggedIn;
      }

      if (isLoggedIn) {
        return Response.redirect(new URL("/decisions", request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
