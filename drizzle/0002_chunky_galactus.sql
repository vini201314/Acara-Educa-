CREATE TABLE `class_content_completions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`studentId` int NOT NULL,
	`score` int,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `class_content_completions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_contents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`authorId` int NOT NULL,
	`type` enum('announcement','lesson','task','quiz','material','video') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`fileUrl` text,
	`videoId` int,
	`dueAt` timestamp,
	`payload` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `class_contents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`teacherId` int NOT NULL,
	`studentId` int NOT NULL,
	`status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`respondedAt` timestamp,
	CONSTRAINT `class_invites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `class_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`classId` int NOT NULL,
	`studentId` int NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `class_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`name` varchar(191) NOT NULL,
	`subject` varchar(64) NOT NULL,
	`schoolYear` varchar(32) NOT NULL,
	`className` varchar(32) NOT NULL,
	`shift` varchar(32) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`question` text NOT NULL,
	`optionsJson` text NOT NULL,
	`correctOption` int NOT NULL,
	`points` int NOT NULL DEFAULT 1,
	CONSTRAINT `quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','teacher','admin','superadmin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `schoolYear` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `className` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `shift` varchar(32);