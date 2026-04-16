CREATE TABLE `companies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`peerGroup` enum('wealth_management','p2p_lending') NOT NULL,
	`category` varchar(100) DEFAULT '',
	`logoUrl` text,
	`productOfferings` json,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `companies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `company_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`metricName` varchar(100) NOT NULL,
	`metricValue` text,
	`metricUnit` varchar(50),
	`period` varchar(50),
	`source` enum('manual','parsed_pdf','parsed_excel','news','uploaded_file') NOT NULL DEFAULT 'manual',
	`sourceDetail` text,
	`isOverridden` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `company_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `file_uploads` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`fileName` varchar(500) NOT NULL,
	`fileType` enum('pdf','excel') NOT NULL,
	`fileUrl` text NOT NULL,
	`fileKey` text NOT NULL,
	`fileSize` int,
	`status` enum('uploaded','parsing','parsed','failed') NOT NULL DEFAULT 'uploaded',
	`parsedData` json,
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `file_uploads_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`peerGroup` enum('wealth_management','p2p_lending','all') NOT NULL,
	`insightType` varchar(100) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`relatedCompanyId` int,
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`companyId` int NOT NULL,
	`headline` text NOT NULL,
	`summary` text,
	`source` varchar(255) NOT NULL,
	`sourceUrl` text NOT NULL,
	`publishedAt` timestamp,
	`fetchedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_items_id` PRIMARY KEY(`id`)
);
