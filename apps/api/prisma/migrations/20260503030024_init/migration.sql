-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NOT NULL,
    `phone_verified` BOOLEAN NOT NULL DEFAULT false,
    `nickname` VARCHAR(50) NOT NULL,
    `is_real_name` BOOLEAN NOT NULL DEFAULT false,
    `job_category` VARCHAR(50) NOT NULL,
    `profile_image_url` VARCHAR(500) NULL,
    `free_views_remaining` INTEGER NOT NULL DEFAULT 3,
    `trust_score` INTEGER NOT NULL DEFAULT 100,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `bio` TEXT NULL,
    `github_url` VARCHAR(500) NULL,
    `linkedin_url` VARCHAR(500) NULL,
    `portfolio_url` VARCHAR(500) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `profiles_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experiences` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `summary` VARCHAR(500) NOT NULL,
    `category` VARCHAR(50) NOT NULL,
    `problem` TEXT NOT NULL,
    `role` TEXT NOT NULL,
    `goal` TEXT NOT NULL,
    `action` TEXT NOT NULL,
    `result` TEXT NOT NULL,
    `achievement` TEXT NULL,
    `lesson` TEXT NULL,
    `status` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'HIDDEN') NOT NULL DEFAULT 'DRAFT',
    `grade` DECIMAL(2, 1) NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experience_proofs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `experience_id` BIGINT NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `file_type` ENUM('IMAGE', 'PDF', 'URL') NOT NULL,
    `ai_verified` BOOLEAN NOT NULL DEFAULT false,
    `ai_confidence` DOUBLE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `votes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `experience_id` BIGINT NOT NULL,
    `voter_id` BIGINT NOT NULL,
    `difficulty` TINYINT NOT NULL,
    `impact` TINYINT NOT NULL,
    `work_value` TINYINT NOT NULL,
    `authenticity` TINYINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `votes_experience_id_voter_id_key`(`experience_id`, `voter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `experience_grades` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `experience_id` BIGINT NOT NULL,
    `grade` DECIMAL(2, 1) NOT NULL,
    `vote_count` INTEGER NOT NULL DEFAULT 0,
    `admin_adjusted` BOOLEAN NOT NULL DEFAULT false,
    `graded_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `experience_grades_experience_id_key`(`experience_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_grades` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `total_score` INTEGER NOT NULL DEFAULT 0,
    `experience_count` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_grades_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `premium_contents` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `experience_id` BIGINT NOT NULL,
    `preview` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `price` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('DRAFT', 'PENDING', 'APPROVED') NOT NULL DEFAULT 'DRAFT',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `premium_contents_experience_id_key`(`experience_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchases` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `premium_content_id` BIGINT NOT NULL,
    `amount` INTEGER NOT NULL,
    `payment_key` VARCHAR(200) NULL,
    `status` ENUM('COMPLETED', 'REFUNDED') NOT NULL DEFAULT 'COMPLETED',
    `purchased_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `purchases_user_id_premium_content_id_key`(`user_id`, `premium_content_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `reporter_id` BIGINT NOT NULL,
    `experience_id` BIGINT NOT NULL,
    `reason` ENUM('FAKE', 'STOLEN', 'INAPPROPRIATE', 'PRIVACY', 'OTHER') NOT NULL,
    `detail` TEXT NULL,
    `status` ENUM('PENDING', 'REVIEWED', 'DISMISSED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reports_reporter_id_experience_id_key`(`reporter_id`, `experience_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_reviews` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `experience_id` BIGINT NOT NULL,
    `admin_id` BIGINT NOT NULL,
    `status` ENUM('APPROVED', 'REJECTED', 'PENDING') NOT NULL,
    `grade_assigned` DECIMAL(2, 1) NULL,
    `note` TEXT NULL,
    `reviewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experiences` ADD CONSTRAINT `experiences_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experience_proofs` ADD CONSTRAINT `experience_proofs_experience_id_fkey` FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_experience_id_fkey` FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_voter_id_fkey` FOREIGN KEY (`voter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experience_grades` ADD CONSTRAINT `experience_grades_experience_id_fkey` FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_grades` ADD CONSTRAINT `user_grades_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `premium_contents` ADD CONSTRAINT `premium_contents_experience_id_fkey` FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_premium_content_id_fkey` FOREIGN KEY (`premium_content_id`) REFERENCES `premium_contents`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_experience_id_fkey` FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_reviews` ADD CONSTRAINT `admin_reviews_experience_id_fkey` FOREIGN KEY (`experience_id`) REFERENCES `experiences`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `admin_reviews` ADD CONSTRAINT `admin_reviews_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
