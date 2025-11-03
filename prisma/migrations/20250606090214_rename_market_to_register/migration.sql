/*
  Warnings:

  - You are about to drop the `markets` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `market_id` on the `rules` table. All the data in the column will be lost.
  - Added the required column `register_id` to the `rules` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "markets";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "registers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coupons" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cover" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    CONSTRAINT "registers_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "register_id" TEXT NOT NULL,
    CONSTRAINT "rules_register_id_fkey" FOREIGN KEY ("register_id") REFERENCES "registers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_rules" ("description", "id") SELECT "description", "id" FROM "rules";
DROP TABLE "rules";
ALTER TABLE "new_rules" RENAME TO "rules";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
