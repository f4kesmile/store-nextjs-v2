-- CreateTable
CREATE TABLE `reseller_sales` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reseller_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `commission` DECIMAL(10, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reseller_sales` ADD CONSTRAINT `reseller_sales_reseller_id_fkey` FOREIGN KEY (`reseller_id`) REFERENCES `resellers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reseller_sales` ADD CONSTRAINT `reseller_sales_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
