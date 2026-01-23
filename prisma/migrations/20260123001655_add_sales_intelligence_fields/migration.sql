-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "bestContactTime" TEXT;
ALTER TABLE "Lead" ADD COLUMN "decisionMaker" TEXT;
ALTER TABLE "Lead" ADD COLUMN "decisionMakerRole" TEXT;
ALTER TABLE "Lead" ADD COLUMN "employeeCount" TEXT;
ALTER TABLE "Lead" ADD COLUMN "estimatedCloseDate" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "leadSource" TEXT;
ALTER TABLE "Lead" ADD COLUMN "nextAction" TEXT;
ALTER TABLE "Lead" ADD COLUMN "nextActionDate" DATETIME;
ALTER TABLE "Lead" ADD COLUMN "painPoints" TEXT;
ALTER TABLE "Lead" ADD COLUMN "preferredContactChannel" TEXT;
ALTER TABLE "Lead" ADD COLUMN "urgencyLevel" TEXT;
