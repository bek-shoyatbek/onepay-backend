/*
  Warnings:

  - You are about to drop the column `admin_telegram_ids` on the `restaurants` table. All the data in the column will be lost.
  - Added the required column `email` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `restaurants` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "restaurants" DROP COLUMN "admin_telegram_ids",
ADD COLUMN     "location" TEXT NOT NULL;
