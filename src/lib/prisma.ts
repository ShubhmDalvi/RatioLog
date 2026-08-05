import "server-only";

import path from "node:path";

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Resolve the database URL. Local development uses a SQLite `file:` URL that
 * is resolved to an absolute path so the adapter always points at the same
 * database regardless of the process working directory. Non-SQLite URLs
 * (production Turso / libSQL) are passed through as-is.
 */
function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";

  if (!url.startsWith("file:")) {
    return url;
  }

  const filePath = url.slice("file:".length);
  if (path.isAbsolute(filePath)) {
    return url;
  }

  return `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), filePath)}`;
}

function createAdapter(): PrismaBetterSqlite3 | PrismaLibSql {
  const url = resolveDatabaseUrl();

  if (url.startsWith("file:")) {
    return new PrismaBetterSqlite3({ url });
  }

  // Turso / libSQL (production). `DATABASE_URL` is the `libsql://` connection
  // string and `TURSO_AUTH_TOKEN` is the database auth token.
  return new PrismaLibSql({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

const adapter = createAdapter();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
