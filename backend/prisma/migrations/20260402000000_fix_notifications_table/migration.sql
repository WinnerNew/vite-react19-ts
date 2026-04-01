-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `messageId` VARCHAR(191) NULL;
ALTER TABLE `notifications` RENAME COLUMN `isRead` TO `read`;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
