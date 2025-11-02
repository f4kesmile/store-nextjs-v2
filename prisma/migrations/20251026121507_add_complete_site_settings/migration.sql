/*
  Warnings:

  - You are about to drop the column `enable_cart_notes` on the `site_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `site_settings` DROP COLUMN `enable_cart_notes`,
    ADD COLUMN `about_description` TEXT NULL,
    ADD COLUMN `about_title` VARCHAR(191) NOT NULL DEFAULT 'Tentang Devlog Store',
    ADD COLUMN `store_location` TEXT NULL,
    ADD COLUMN `support_email` VARCHAR(191) NOT NULL DEFAULT 'support@store.com',
    ADD COLUMN `support_whatsapp` VARCHAR(191) NOT NULL DEFAULT '6281234567890';
