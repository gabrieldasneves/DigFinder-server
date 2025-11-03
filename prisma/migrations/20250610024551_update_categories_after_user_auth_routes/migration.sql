/*
  Warnings:

  - You are about to drop the column `category` on the `Discovery` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "_CategoryToDiscovery" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_CategoryToDiscovery_A_fkey" FOREIGN KEY ("A") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CategoryToDiscovery_B_fkey" FOREIGN KEY ("B") REFERENCES "Discovery" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    CONSTRAINT "Discovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Discovery" ("createdAt", "description", "discoveryDate", "id", "latitude", "longitude", "status", "title", "updatedAt", "userId", "verificationDate", "verifiedBy") SELECT "createdAt", "description", "discoveryDate", "id", "latitude", "longitude", "status", "title", "updatedAt", "userId", "verificationDate", "verifiedBy" FROM "Discovery";
DROP TABLE "Discovery";
ALTER TABLE "new_Discovery" RENAME TO "Discovery";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToDiscovery_AB_unique" ON "_CategoryToDiscovery"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToDiscovery_B_index" ON "_CategoryToDiscovery"("B");
