-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('INIT', 'PENDING', 'PAID', 'CANCELED');

-- CreateTable
CREATE TABLE "RestaurantSchema" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "adminTelegramIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransactionSchema" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotId" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'INIT',
    "provider" TEXT NOT NULL,
    "terminal" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "tip" DOUBLE PRECISION NOT NULL,
    "isTipOnly" BOOLEAN NOT NULL,
    "tableId" TEXT,
    "transId" TEXT,
    "prepareId" INTEGER,
    "performTime" TIMESTAMP(3),
    "cancelTime" TIMESTAMP(3),
    "state" INTEGER,
    "reason" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waiter" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "waiterId" TEXT NOT NULL,
    "phone" TEXT,
    "telegramId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Waiter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "phone" TEXT,
    "telegramId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipTransaction" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "waiterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Waiter_restaurantId_idx" ON "Waiter"("restaurantId");

-- CreateIndex
CREATE INDEX "Admin_restaurantId_idx" ON "Admin"("restaurantId");

-- CreateIndex
CREATE INDEX "TipTransaction_restaurantId_idx" ON "TipTransaction"("restaurantId");

-- CreateIndex
CREATE INDEX "TipTransaction_waiterId_idx" ON "TipTransaction"("waiterId");

-- AddForeignKey
ALTER TABLE "Waiter" ADD CONSTRAINT "Waiter_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "RestaurantSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "RestaurantSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipTransaction" ADD CONSTRAINT "TipTransaction_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "RestaurantSchema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TipTransaction" ADD CONSTRAINT "TipTransaction_waiterId_fkey" FOREIGN KEY ("waiterId") REFERENCES "Waiter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
