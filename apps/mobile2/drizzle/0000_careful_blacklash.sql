CREATE TABLE `tracked_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`backend_id` text NOT NULL,
	`normalized_username` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_players_backend_id_unique` ON `tracked_players` (`backend_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tracked_players_normalized_username_unique` ON `tracked_players` (`normalized_username`);