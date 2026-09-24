CREATE TABLE `achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(80) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text NOT NULL,
	`requirementType` enum('lessons','level') NOT NULL,
	`threshold` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `achievements_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `challenge_answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`challengeId` int NOT NULL,
	`selectedOption` int NOT NULL,
	`isCorrect` boolean NOT NULL,
	`xpAwarded` int NOT NULL DEFAULT 0,
	`answeredAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `challenge_answers_id` PRIMARY KEY(`id`),
	CONSTRAINT `challenge_answers_user_challenge_unique` UNIQUE(`userId`,`challengeId`)
);
--> statement-breakpoint
CREATE TABLE `daily_challenges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`optionA` varchar(500) NOT NULL,
	`optionB` varchar(500) NOT NULL,
	`optionC` varchar(500) NOT NULL,
	`optionD` varchar(500) NOT NULL,
	`correctOption` int NOT NULL,
	`challengeDate` varchar(10) NOT NULL,
	`active` boolean NOT NULL DEFAULT true,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_challenges_id` PRIMARY KEY(`id`),
	CONSTRAINT `daily_challenges_challengeDate_unique` UNIQUE(`challengeDate`)
);
--> statement-breakpoint
CREATE TABLE `student_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`xp` int NOT NULL DEFAULT 0,
	`level` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_stats_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_stats_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`achievementId` int NOT NULL,
	`unlockedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_achievements_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_achievements_user_achievement_unique` UNIQUE(`userId`,`achievementId`)
);
