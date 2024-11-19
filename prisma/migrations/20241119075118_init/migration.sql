-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INIT', 'PENDING', 'PAID', 'CANCELED');

-- CreateEnum
CREATE TYPE "Provider" AS ENUM ('uzum', 'click', 'payme');

-- CreateEnum
CREATE TYPE "Terminal" AS ENUM ('poster', 'rkeeper', 'iiko');

-- CreateTable
CREATE TABLE "Restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "adminTelegramIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INIT',
    "provider" "Provider" NOT NULL,
    "terminal" "Terminal" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tip" DOUBLE PRECISION NOT NULL,
    "transId" TEXT,
    "prepareId" INTEGER,
    "performTime" TIMESTAMP(3),
    "cancelTime" TIMESTAMP(3),
    "state" INTEGER,
    "reason" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waiters" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "waiterId" TEXT NOT NULL,
    "phone" TEXT,
    "telegramId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waiters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admins" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "phone" TEXT,
    "telegramId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipTransactions" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "waiterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipTransactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Waiters_restaurantId_idx" ON "Waiters"("restaurantId");

-- CreateIndex
CREATE INDEX "Admins_restaurantId_idx" ON "Admins"("restaurantId");

-- CreateIndex
CREATE INDEX "TipTransactions_restaurantId_idx" ON "TipTransactions"("restaurantId");

-- CreateIndex
CREATE INDEX "TipTransactions_waiterId_idx" ON "TipTransactions"("waiterId");

-- AddForeignKey
ALTER TABLE "Waiters" ADD CONSTRAINT "Waiters_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admins" ADD CONSTRAINT "Admins_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipTransactions" ADD CONSTRAINT "TipTransactions_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipTransactions" ADD CONSTRAINT "TipTransactions_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES "Waiters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
