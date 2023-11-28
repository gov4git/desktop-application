CREATE TABLE `communities` (
	`url` text PRIMARY KEY NOT NULL,
	`branch` text NOT NULL,
	`name` text NOT NULL,
	`configPath` text NOT NULL,
	`projectUrl` text NOT NULL,
	`selected` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `userCommunities` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`communityId` text NOT NULL,
	`isMember` integer NOT NULL,
	`isMaintainer` integer NOT NULL,
	`votingCredits` real NOT NULL,
	`votingScore` real NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`communityId`) REFERENCES `communities`(`url`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`pat` text NOT NULL,
	`memberPublicUrl` text NOT NULL,
	`memberPublicBranch` text NOT NULL,
	`memberPrivateUrl` text NOT NULL,
	`memberPrivateBranch` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE ballots ADD `status` text DEFAULT 'open' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `userCommunities_communityId_unique` ON `userCommunities` (`communityId`);