/*
  Warnings:

  - Changed the type of `provider` on the `Transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('uzum', 'click', 'payme');

-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "provider",
ADD COLUMN     "provider" "PaymentProvider" NOT NULL;

-- DropEnum
DROP TYPE "Provider";
