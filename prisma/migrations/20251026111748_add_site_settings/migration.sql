-- CreateTable
CREATE TABLE `site_settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `enable_cart_notes` BOOLEAN NOT NULL DEFAULT true,
    `storeName` VARCHAR(191) NOT NULL DEFAULT 'Store Saya',
    `store_description` TEXT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
