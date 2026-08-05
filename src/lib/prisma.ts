import "server-only";

import path from "node:path";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

/**
 * Resolve the SQLite `file:` URL to an absolute path so the adapter always
 * points at the same database regardless of the process working directory.
 * Non-SQLite URLs (future PostgreSQL deployments) are passed through as-is.
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

const adapter = new PrismaBetterSqlite3({ url: resolveDatabaseUrl() });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
