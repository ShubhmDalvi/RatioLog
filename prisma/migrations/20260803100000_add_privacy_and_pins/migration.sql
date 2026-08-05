-- CreateTable
CREATE TABLE "PinnedDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PinnedDecision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PinnedDecision_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Decision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PROPOSED',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "context" TEXT NOT NULL DEFAULT '',
    "decision" TEXT NOT NULL DEFAULT '',
    "consequences" TEXT NOT NULL DEFAULT '',
    "tags" TEXT NOT NULL DEFAULT '[]',
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "supersededById" TEXT,
    CONSTRAINT "Decision_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Decision_supersededById_fkey" FOREIGN KEY ("supersededById") REFERENCES "Decision" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Decision" ("consequences", "context", "createdAt", "createdById", "date", "decision", "id", "status", "supersededById", "tags", "title", "updatedAt") SELECT "consequences", "context", "createdAt", "createdById", "date", "decision", "id", "status", "supersededById", "tags", "title", "updatedAt" FROM "Decision";
DROP TABLE "Decision";
ALTER TABLE "new_Decision" RENAME TO "Decision";
CREATE UNIQUE INDEX "Decision_supersededById_key" ON "Decision"("supersededById");
CREATE INDEX "Decision_status_idx" ON "Decision"("status");
CREATE INDEX "Decision_date_idx" ON "Decision"("date");
CREATE INDEX "Decision_createdById_idx" ON "Decision"("createdById");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PinnedDecision_userId_idx" ON "PinnedDecision"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedDecision_userId_decisionId_key" ON "PinnedDecision"("userId", "decisionId");
