/*
  Warnings:

  - Added the required column `lable` to the `productCategory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_productCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "lable" TEXT NOT NULL
);
INSERT INTO "new_productCategory" ("id", "name") SELECT "id", "name" FROM "productCategory";
DROP TABLE "productCategory";
ALTER TABLE "new_productCategory" RENAME TO "productCategory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
