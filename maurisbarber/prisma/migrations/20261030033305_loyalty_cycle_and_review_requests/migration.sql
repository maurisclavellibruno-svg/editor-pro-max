-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "loyaltyPromptAnsweredAt" TIMESTAMP(3),
ADD COLUMN     "reviewRequestSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "loyaltyCardCycleStartedAt" TIMESTAMP(3);
