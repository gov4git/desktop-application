ALTER TABLE userCommunities ADD `uniqueId` text;--> statement-breakpoint
ALTER TABLE userCommunities ADD `joinRequestUrl` text;--> statement-breakpoint
ALTER TABLE userCommunities ADD `joinRequestStatus` text;--> statement-breakpoint
CREATE UNIQUE INDEX `userCommunities_uniqueId_unique` ON `userCommunities` (`uniqueId`);