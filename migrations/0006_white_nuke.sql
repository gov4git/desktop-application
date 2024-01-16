CREATE TABLE `appSettings` (
	`id` integer PRIMARY KEY NOT NULL,
	`schemaVersion` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `motions` (
	`id` integer PRIMARY KEY NOT NULL,
	`motionId` text NOT NULL,
	`ballotId` text NOT NULL,
	`openedAt` text NOT NULL,
	`closedAt` text NOT NULL,
	`type` text NOT NULL,
	`trackerUrl` text NOT NULL,
	`communityUrl` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`choices` text NOT NULL,
	`choice` text NOT NULL,
	`score` real NOT NULL,
	`userScore` real NOT NULL,
	`userStrength` real NOT NULL,
	`status` text DEFAULT 'open' NOT NULL,
	`userVoted` integer DEFAULT false NOT NULL,
	`userVotePending` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
DROP TABLE `ballots`;--> statement-breakpoint
DROP TABLE `configStore`;--> statement-breakpoint
DROP TABLE `configs`;--> statement-breakpoint
DROP TABLE `userCommunities`;--> statement-breakpoint
ALTER TABLE communities ADD `privateUrl` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE communities ADD `isMember` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE communities ADD `isMaintainer` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE communities ADD `joinRequestUrl` text;--> statement-breakpoint
ALTER TABLE communities ADD `joinRequestStatus` text;--> statement-breakpoint
ALTER TABLE communities ADD `userVotingCredits` real DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `motions_motionId_ballotId_communityUrl_unique` ON `motions` (`motionId`,`ballotId`,`communityUrl`);