/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RestaurantSchema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TransactionSchema` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Waiter` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "TipTransaction" DROP CONSTRAINT "TipTransaction_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "TipTransaction" DROP CONSTRAINT "TipTransaction_waiterId_fkey";

-- DropForeignKey
ALTER TABLE "Waiter" DROP CONSTRAINT "Waiter_restaurantId_fkey";

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "RestaurantSchema";

-- DropTable
DROP TABLE "TipTransaction";

-- DropTable
DROP TABLE "TransactionSchema";

-- DropTable
DROP TABLE "Waiter";

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "admin_telegram_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transaction_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "spot_id" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INIT',
    "provider" TEXT NOT NULL,
    "terminal" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tip" DOUBLE PRECISION NOT NULL,
    "is_tip_only" BOOLEAN NOT NULL,
    "table_id" TEXT,
    "payme_trans_id" TEXT,
    "click_prepare_id" INTEGER,
    "payme_perform_time" TIMESTAMP(3),
    "payme_cancel_time" TIMESTAMP(3),
    "payme_state" INTEGER,
    "payme_reason" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "waiters" (
    "waiter_id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "phone" TEXT,
    "telegram_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waiters_pkey" PRIMARY KEY ("waiter_id")
);

-- CreateTable
CREATE TABLE "admins" (
    "admin_id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "phone" TEXT,
    "telegram_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "tips" (
    "tip_transaction_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "waiter_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tips_pkey" PRIMARY KEY ("tip_transaction_id")
);

-- CreateIndex
CREATE INDEX "restaurants_title_idx" ON "restaurants"("title");

-- CreateIndex
CREATE INDEX "waiters_restaurant_id_idx" ON "waiters"("restaurant_id");

-- CreateIndex
CREATE INDEX "admins_restaurant_id_idx" ON "admins"("restaurant_id");

-- CreateIndex
CREATE INDEX "tips_restaurant_id_idx" ON "tips"("restaurant_id");

-- CreateIndex
CREATE INDEX "tips_waiter_id_idx" ON "tips"("waiter_id");

-- AddForeignKey
ALTER TABLE "waiters" ADD CONSTRAINT "waiters_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_waiter_id_fkey" FOREIGN KEY ("waiter_id") REFERENCES "waiters"("waiter_id") ON DELETE RESTRICT ON UPDATE CASCADE;
