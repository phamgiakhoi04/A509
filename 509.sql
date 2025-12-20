CREATE TABLE `roles` (
   `role_id` bigint NOT NULL AUTO_INCREMENT,
   `name` varchar(255) NOT NULL,
   PRIMARY KEY (`role_id`),
   UNIQUE KEY `name` (`name`)
 ) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `users` (
   `user_id` bigint NOT NULL AUTO_INCREMENT,
   `username` varchar(255) NOT NULL,
   `email` varchar(255) NOT NULL,
   `password_hash` varchar(255) NOT NULL,
   `full_name` varchar(255) DEFAULT NULL,
   `phone_number` varchar(255) DEFAULT NULL,
   `status` tinyint(1) DEFAULT '1',
   `role_id` bigint NOT NULL DEFAULT '1',
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   `avatar_url` varchar(255) DEFAULT NULL,
   `reset_token` varchar(255) DEFAULT NULL,
   `reset_token_expiry` timestamp NULL DEFAULT NULL,
   PRIMARY KEY (`user_id`),
   UNIQUE KEY `username` (`username`),
   UNIQUE KEY `email` (`email`),
   KEY `fk_users_role` (`role_id`),
   CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`)
 ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `countries` (
   `country_id` bigint NOT NULL AUTO_INCREMENT,
   `country_name` varchar(255) NOT NULL,
   `continent` varchar(255) DEFAULT NULL,
   `flag_image_url` varchar(255) DEFAULT NULL,
   `description` text,
   PRIMARY KEY (`country_id`),
   UNIQUE KEY `country_name` (`country_name`)
 ) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `uniforms` (
   `uniform_id` bigint NOT NULL AUTO_INCREMENT,
   `name` varchar(255) NOT NULL,
   `description` text,
   `history` longtext,
   `material` varchar(255) DEFAULT NULL,
   `country_id` bigint NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`uniform_id`),
   KEY `fk_uniforms_country` (`country_id`),
   CONSTRAINT `fk_uniforms_country` FOREIGN KEY (`country_id`) REFERENCES `countries` (`country_id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `images` (
   `image_id` bigint NOT NULL AUTO_INCREMENT,
   `uniform_id` bigint NOT NULL,
   `image_url` varchar(255) NOT NULL,
   `description` text,
   PRIMARY KEY (`image_id`),
   KEY `fk_images_uniform` (`uniform_id`),
   CONSTRAINT `fk_images_uniform` FOREIGN KEY (`uniform_id`) REFERENCES `uniforms` (`uniform_id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci

CREATE TABLE `comments` (
   `comment_id` bigint NOT NULL AUTO_INCREMENT,
   `content` text NOT NULL,
   `user_id` bigint NOT NULL,
   `uniform_id` bigint NOT NULL,
   `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
   `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`comment_id`),
   KEY `fk_comments_user` (`user_id`),
   KEY `fk_comments_uniform` (`uniform_id`),
   CONSTRAINT `fk_comments_uniform` FOREIGN KEY (`uniform_id`) REFERENCES `uniforms` (`uniform_id`) ON DELETE CASCADE,
   CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
 ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci