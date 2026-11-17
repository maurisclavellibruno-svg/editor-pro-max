-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "badge" TEXT,
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promoEndsAt" TIMESTAMP(3),
ADD COLUMN     "promoPrice" DECIMAL(10,2),
ADD COLUMN     "promoStartsAt" TIMESTAMP(3),
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "specialDates" TEXT[],
ADD COLUMN     "specialPrice" DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

