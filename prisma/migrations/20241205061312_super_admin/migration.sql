/*
  Warnings:

  - You are about to drop the `SuperAdmin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "SuperAdmin";

-- CreateTable
CREATE TABLE "super_admins" (
    "super_admin_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("super_admin_id")
);
