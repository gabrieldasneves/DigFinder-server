-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Discovery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "discoveryDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "verifiedBy" TEXT,
    "verificationDate" DATETIME,
    CONSTRAINT "Discovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Discovery" ("createdAt", "description", "discoveryDate", "id", "latitude", "longitude", "status", "title", "updatedAt", "userId", "verificationDate", "verifiedBy") SELECT "createdAt", "description", "discoveryDate", "id", "latitude", "longitude", "status", "title", "updatedAt", "userId", "verificationDate", "verifiedBy" FROM "Discovery";
DROP TABLE "Discovery";
ALTER TABLE "new_Discovery" RENAME TO "Discovery";
CREATE TABLE "new_Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Verification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Verification" ("createdAt", "expiresAt", "id", "token", "type", "userId") SELECT "createdAt", "expiresAt", "id", "token", "type", "userId" FROM "Verification";
DROP TABLE "Verification";
ALTER TABLE "new_Verification" RENAME TO "Verification";
CREATE UNIQUE INDEX "Verification_token_key" ON "Verification"("token");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
