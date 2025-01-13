/*
  Warnings:

  - Added the required column `fullname` to the `waiters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "waiters" ADD COLUMN     "fullname" TEXT NOT NULL,
ADD COLUMN     "image" TEXT;
