-- AlterTable
ALTER TABLE `posts` MODIFY `content` TEXT NOT NULL,
    MODIFY `image` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `avatar` LONGTEXT NOT NULL,
    MODIFY `bio` TEXT NULL;
