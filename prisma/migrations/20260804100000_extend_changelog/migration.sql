-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChangelogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'CHANGED',
    "scope" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    "decisionId" TEXT,
    CONSTRAINT "ChangelogEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChangelogEntry_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ChangelogEntry" ("createdAt", "createdById", "date", "description", "id", "title", "type", "updatedAt") SELECT "createdAt", "createdById", "date", "description", "id", "title", "type", "updatedAt" FROM "ChangelogEntry";
DROP TABLE "ChangelogEntry";
ALTER TABLE "new_ChangelogEntry" RENAME TO "ChangelogEntry";
CREATE INDEX "ChangelogEntry_date_idx" ON "ChangelogEntry"("date");
CREATE INDEX "ChangelogEntry_createdById_idx" ON "ChangelogEntry"("createdById");
CREATE INDEX "ChangelogEntry_decisionId_idx" ON "ChangelogEntry"("decisionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
