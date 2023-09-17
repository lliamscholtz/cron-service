/*
  Warnings:

  - You are about to drop the column `name` on the `Cron` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cron" DROP COLUMN "name",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false;
