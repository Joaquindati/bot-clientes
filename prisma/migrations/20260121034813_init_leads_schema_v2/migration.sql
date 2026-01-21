-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "place_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "rating" REAL,
    "phone" TEXT,
    "website" TEXT,
    "city" TEXT,
    "keyword" TEXT,
    "emails" TEXT NOT NULL,
    "socials" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_place_id_key" ON "Lead"("place_id");
