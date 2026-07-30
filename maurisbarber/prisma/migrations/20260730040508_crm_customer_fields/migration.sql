-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "beardPreference" TEXT,
ADD COLUMN     "dislikedNotes" TEXT,
ADD COLUMN     "favoriteCut" TEXT,
ADD COLUMN     "generalPreferences" TEXT,
ADD COLUMN     "hairColor" TEXT,
ADD COLUMN     "likedNotes" TEXT,
ADD COLUMN     "likesToTalk" BOOLEAN,
ADD COLUMN     "musicPreference" TEXT,
ADD COLUMN     "productsUsed" TEXT;

-- CreateTable
CREATE TABLE "CustomerPhoto" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerPhoto_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CustomerPhoto" ADD CONSTRAINT "CustomerPhoto_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
