-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PinnedDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PinnedDecision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PinnedDecision_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PinnedDecision" ("createdAt", "decisionId", "id", "userId") SELECT "createdAt", "decisionId", "id", "userId" FROM "PinnedDecision";
DROP TABLE "PinnedDecision";
ALTER TABLE "new_PinnedDecision" RENAME TO "PinnedDecision";
CREATE INDEX "PinnedDecision_userId_idx" ON "PinnedDecision"("userId");
CREATE UNIQUE INDEX "PinnedDecision_userId_decisionId_key" ON "PinnedDecision"("userId", "decisionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
