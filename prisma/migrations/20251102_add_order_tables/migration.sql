-- CreateTable
CREATE TABLE `orders` (
    `id` VARCHAR(191) NOT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `customer_email` VARCHAR(191) NOT NULL,
    `customer_phone` VARCHAR(191) NOT NULL,
    `customer_address` TEXT NOT NULL,
    `payment_method` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `notes` TEXT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `total_items` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `reseller_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` VARCHAR(191) NOT NULL,
    `product_id` INTEGER NOT NULL,
    `variant_id` INTEGER NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DECIMAL(10, 2) NOT NULL,
    `total_price` DECIMAL(12, 2) NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Update existing ActivityLog table
ALTER TABLE `activity_logs` 
ADD COLUMN `type` VARCHAR(191) NOT NULL DEFAULT 'user_action',
ADD COLUMN `title` VARCHAR(191) NOT NULL DEFAULT '',
ADD COLUMN `description` TEXT NOT NULL DEFAULT '',
ADD COLUMN `metadata` JSON NULL,
ADD COLUMN `ip_address` VARCHAR(191) NULL,
ADD COLUMN `user_agent` VARCHAR(191) NULL,
MODIFY COLUMN `user_id` INTEGER NULL;

-- Update SiteSettings table with new fields
ALTER TABLE `site_settings`
ADD COLUMN `business_address` TEXT NULL,
ADD COLUMN `primary_color` VARCHAR(191) NOT NULL DEFAULT '#3B82F6',
ADD COLUMN `secondary_color` VARCHAR(191) NOT NULL DEFAULT '#10B981',
ADD COLUMN `logo_url` VARCHAR(191) NULL,
ADD COLUMN `favicon_url` VARCHAR(191) NULL;

-- Add Foreign Key Constraints
ALTER TABLE `orders` ADD CONSTRAINT `orders_reseller_id_fkey` FOREIGN KEY (`reseller_id`) REFERENCES `resellers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE `order_items` ADD CONSTRAINT `order_items_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;