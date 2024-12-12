/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `super_admins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "super_admins" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
