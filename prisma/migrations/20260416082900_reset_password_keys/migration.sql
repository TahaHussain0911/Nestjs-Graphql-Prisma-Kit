-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otp" TEXT,
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otpVerified" BOOLEAN,
ADD COLUMN     "passwordChangedAt" TIMESTAMP(3),
ADD COLUMN     "photo" TEXT;
