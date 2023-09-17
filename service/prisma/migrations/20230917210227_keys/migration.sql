/*
  Warnings:

  - You are about to drop the column `user_id` on the `Cron` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cron" DROP CONSTRAINT "Cron_user_id_fkey";

-- AlterTable
ALTER TABLE "Cron" DROP COLUMN "user_id";

-- AddForeignKey
ALTER TABLE "Cron" ADD CONSTRAINT "Cron_key_fkey" FOREIGN KEY ("key") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
