/*
  Warnings:

  - Changed the type of `terminal` on the `Transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `provider` on the `Transactions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Transactions" DROP COLUMN "terminal",
ADD COLUMN     "terminal" TEXT NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PaymentProvider";

-- DropEnum
DROP TYPE "Terminal";
