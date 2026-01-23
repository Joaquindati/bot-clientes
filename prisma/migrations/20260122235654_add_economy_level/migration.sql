-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "place_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "rating" REAL,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "keyword" TEXT,
    "emails" TEXT NOT NULL,
    "socials" TEXT NOT NULL,
    "techStack" TEXT,
    "hasSsl" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "lastContactDate" DATETIME,
    "economyLevel" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Lead" ("address", "city", "country", "createdAt", "emails", "hasSsl", "id", "keyword", "lastContactDate", "name", "notes", "phone", "place_id", "rating", "socials", "state", "status", "techStack", "updatedAt", "website") SELECT "address", "city", "country", "createdAt", "emails", "hasSsl", "id", "keyword", "lastContactDate", "name", "notes", "phone", "place_id", "rating", "socials", "state", "status", "techStack", "updatedAt", "website" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_place_id_key" ON "Lead"("place_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
