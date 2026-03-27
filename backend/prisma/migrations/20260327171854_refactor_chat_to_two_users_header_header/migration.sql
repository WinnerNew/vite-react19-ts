/*
  Warnings:

  - You are about to drop the column `participantId` on the `chats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user1Id,user2Id]` on the table `chats` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user1Id` to the `chats` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `chats` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `chats` DROP FOREIGN KEY `chats_participantId_fkey`;

-- DropIndex
DROP INDEX `Chat_participantId_fkey` ON `chats`;

-- AlterTable
ALTER TABLE `chats` DROP COLUMN `participantId`,
    ADD COLUMN `user1Id` VARCHAR(191) NOT NULL,
    ADD COLUMN `user2Id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `chats_user1Id_user2Id_key` ON `chats`(`user1Id`, `user2Id`);

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_user1Id_fkey` FOREIGN KEY (`user1Id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chats` ADD CONSTRAINT `chats_user2Id_fkey` FOREIGN KEY (`user2Id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
