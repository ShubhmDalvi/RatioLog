import "dotenv/config";

import path from "node:path";

import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

function resolveDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (!url.startsWith("file:")) {
    return url;
  }
  const filePath = url.slice("file:".length);
  if (path.isAbsolute(filePath)) {
    return url;
  }
  return `file:${path.resolve(process.cwd(), filePath)}`;
}

function createAdapter(): PrismaBetterSqlite3 | PrismaLibSql {
  const url = resolveDatabaseUrl();

  if (url.startsWith("file:")) {
    return new PrismaBetterSqlite3({ url });
  }

  return new PrismaLibSql({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

const adapter = createAdapter();
const prisma = new PrismaClient({ adapter });

type SeedDecision = {
  title: string;
  status: "PROPOSED" | "ACCEPTED" | "DEPRECATED" | "SUPERSEDED" | "REJECTED";
  date: string;
  tags: string[];
  context: string;
  decision: string;
  consequences: string;
  supersedes?: string;
  pinned?: boolean;
};

const seedDecisions: SeedDecision[] = [
  {
    title: "Adopt React Server Components for data fetching",
    status: "ACCEPTED",
    date: "2026-01-12",
    tags: ["architecture", "frontend"],
    context: `Most pages only need data the server already has. Fetching on the server removes loading flashes, reduces client bundle size, and keeps secrets off the wire.`,
    decision: `We adopt **React Server Components** as the default for data fetching across the app. Client components are used only where interactivity or browser APIs are required.`,
    consequences: `- Easier: less client state, no data-fetching libraries needed.
- Harder: some components must be split to keep them on the server.`,
  },
  {
    title: "Adopt Prisma as the data layer",
    status: "ACCEPTED",
    date: "2026-02-03",
    tags: ["database", "architecture"],
    context: `We need typed queries and a portable migration story. Hand-written SQL works but slows down feature work and drifts across environments.`,
    decision: `Use **Prisma** as the ORM. The schema is the single source of truth, and migrations are versioned alongside the code.`,
    consequences: `- Easier: end-to-end type safety between schema and queries.
- Harder: raw SQL for rare, very custom queries requires escaping the ORM.`,
  },
  {
    title: "Use SQLite for local development",
    status: "SUPERSEDED",
    date: "2026-02-10",
    tags: ["database", "tooling"],
    context: `Developers should be able to clone the repo and run the app with zero external services.`,
    decision: `Run local development against a **SQLite** file database so setup is a single command.`,
    consequences: `- Easier: zero-config local setup.
- Harder: subtle differences from production Turso.`,
    supersedes: undefined,
  },
  {
    title: "Use Turso in production",
    status: "ACCEPTED",
    date: "2026-03-01",
    tags: ["database", "infrastructure"],
    pinned: true,
    context: `SQLite cannot serve concurrent writes at production scale, and we want full-text search later.`,
    decision: `Deploy on **Turso** (distributed libSQL). Same SQLite dialect locally and in production, so the only difference is the connection string.`,
    consequences: `- Easier: hosted backups, edge replicas, and the same SQL dialect everywhere.
- Harder: a real database dependency in the deploy pipeline.`,
    supersedes: "Use SQLite for local development",
  },
  {
    title: "Store tags inline as JSON",
    status: "SUPERSEDED",
    date: "2026-03-05",
    tags: ["schema", "database"],
    context: `Decisions need lightweight tagging. A dedicated tags table felt heavy for v1.`,
    decision: `Store tags as a **JSON array** string on the decision row.`,
    consequences: `- Easier: simple schema, trivial read/write.
- Harder: tag filtering is string matching rather than relational.`,
    supersedes: undefined,
  },
  {
    title: "Move tags to a dedicated table",
    status: "PROPOSED",
    date: "2026-03-20",
    tags: ["schema", "database"],
    context: `Tag filtering and aggregation are getting awkward with JSON strings, and the schema no longer needs to support SQLite scalar-list limitations.`,
    decision: `Move tags to a dedicated **many-to-many** table so filtering and autocomplete are relational.`,
    consequences: `- Easier: exact tag queries and tag cloud aggregation.
- Harder: a migration and slightly more complex writes.`,
    supersedes: "Store tags inline as JSON",
  },
  {
    title: "Deprecate the legacy changelog endpoint",
    status: "DEPRECATED",
    date: "2026-04-02",
    tags: ["api", "changelog"],
    context: `The \`/api/changelog\` endpoint predates the decisions feature and no longer has consumers.`,
    decision: `Deprecate the endpoint and remove it next release.`,
    consequences: `- Easier: one fewer surface to maintain.
- Harder: any forgotten consumer breaks silently.`,
  },
  {
    title: "Adopt Auth.js for authentication",
    status: "ACCEPTED",
    date: "2026-05-15",
    tags: ["auth", "security"],
    pinned: true,
    context: `We need a single email + password flow with session cookies, and the option to add OAuth providers later without rework.`,
    decision: `Use **Auth.js (NextAuth v5)** with the Credentials provider and JWT sessions.`,
    consequences: `- Easier: battle-tested sessions and a clear path to OAuth.
- Harder: credentials-only auth requires careful password handling.`,
  },
];

async function main() {
  const email = process.env.SEED_EMAIL ?? "demo@ratiolog.dev";
  const password = process.env.SEED_PASSWORD ?? "password123";
  const name = "Demo User";

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name, passwordHash },
  });

  // Upsert decisions by title so ids stay stable across reseeds (open tabs
  // keep working and supersedes links are preserved).
  const created: Record<string, string> = {};
  for (const item of seedDecisions) {
    const existing = await prisma.decision.findFirst({
      where: { title: item.title, createdById: user.id },
      select: { id: true },
    });

    const decision = existing
      ? await prisma.decision.update({
          where: { id: existing.id },
          data: {
            status: item.status,
            date: new Date(`${item.date}T00:00:00`),
            context: item.context,
            decision: item.decision,
            consequences: item.consequences,
            tags: JSON.stringify(item.tags),
          },
        })
      : await prisma.decision.create({
          data: {
            title: item.title,
            status: item.status,
            date: new Date(`${item.date}T00:00:00`),
            context: item.context,
            decision: item.decision,
            consequences: item.consequences,
            tags: JSON.stringify(item.tags),
            createdById: user.id,
          },
        });

    created[item.title] = decision.id;
  }

  for (const item of seedDecisions) {
    if (!item.supersedes) {
      continue;
    }
    const currentId = created[item.title];
    const supersededId = created[item.supersedes];
    if (currentId && supersededId) {
      await prisma.decision.update({
        where: { id: supersededId },
        data: { supersededById: currentId },
      });
    }
  }

  // Pin a few decisions for the demo user (per-user pins).
  for (const item of seedDecisions) {
    if (!item.pinned) {
      continue;
    }
    const decisionId = created[item.title];
    if (!decisionId) {
      continue;
    }
    await prisma.pinnedDecision.upsert({
      where: { userId_decisionId: { userId: user.id, decisionId } },
      update: {},
      create: { userId: user.id, decisionId },
    });
  }

  const count = await prisma.decision.count({ where: { createdById: user.id } });
  console.log(
    `Seeded demo user: ${email} (password: ${password}) with ${count} decisions`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
