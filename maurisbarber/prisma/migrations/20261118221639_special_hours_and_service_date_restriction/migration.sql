-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "restrictedDates" TEXT[];

-- CreateTable
CREATE TABLE "SpecialDayHours" (
    "id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "reason" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpecialDayHours_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecialDayHours_date_key" ON "SpecialDayHours"("date");

