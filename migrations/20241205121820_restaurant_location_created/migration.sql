-- CreateEnum
CREATE TYPE "TransactionSchemaStatusType" AS ENUM ('INIT', 'PENDING', 'PAID', 'CANCELED');

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "telegram_id" TEXT NOT NULL DEFAULT '',
    "restaurant" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "admin_telegram_ids" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL,
    "super_admin_id" TEXT NOT NULL DEFAULT 'super-admin1733400687472',
    "email" TEXT NOT NULL DEFAULT '',
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tips" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "restaurant" TEXT,
    "waiter" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "tips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL DEFAULT '',
    "user_id" TEXT NOT NULL DEFAULT '',
    "spot_id" TEXT NOT NULL DEFAULT '',
    "status" "TransactionSchemaStatusType" DEFAULT 'INIT',
    "provider" TEXT NOT NULL DEFAULT '',
    "terminal" TEXT NOT NULL DEFAULT '',
    "amount" DOUBLE PRECISION NOT NULL,
    "tip" DOUBLE PRECISION,
    "is_tip_only" TEXT NOT NULL DEFAULT '',
    "table_id" TEXT NOT NULL DEFAULT '',
    "payme_trans_id" TEXT NOT NULL DEFAULT '',
    "click_prepare_id" TEXT NOT NULL DEFAULT '',
    "payme_perform_time" TIMESTAMP(3),
    "payme_cancel_time" TIMESTAMP(3),
    "payme_state" TEXT NOT NULL DEFAULT '',
    "payme_reason" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waiters" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL DEFAULT '',
    "telegram_id" TEXT NOT NULL DEFAULT '',
    "restaurant" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "waiters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admins_restaurant_idx" ON "admins"("restaurant");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_admin_telegram_ids_key" ON "restaurants"("admin_telegram_ids");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_email_key" ON "super_admins"("email");

-- CreateIndex
CREATE INDEX "tips_restaurant_idx" ON "tips"("restaurant");

-- CreateIndex
CREATE INDEX "tips_waiter_idx" ON "tips"("waiter");

-- CreateIndex
CREATE INDEX "waiters_restaurant_idx" ON "waiters"("restaurant");

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_restaurant_fkey" FOREIGN KEY ("restaurant") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_restaurant_fkey" FOREIGN KEY ("restaurant") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tips" ADD CONSTRAINT "tips_waiter_fkey" FOREIGN KEY ("waiter") REFERENCES "waiters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waiters" ADD CONSTRAINT "waiters_restaurant_fkey" FOREIGN KEY ("restaurant") REFERENCES "restaurants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
