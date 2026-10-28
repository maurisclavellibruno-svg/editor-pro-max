-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "loyaltyCardEnrolled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "loyaltyCardRedemptions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "loyaltyCardStamps" INTEGER NOT NULL DEFAULT 0;
