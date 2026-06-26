const migrations = {
  journal: {
    entries: [
      {
        idx: 0,
        version: "6",
        when: 1782493040855,
        tag: "0000_careful_blacklash",
        breakpoints: true,
      },
    ],
  },
  migrations: {
    m0000:
      "CREATE TABLE `tracked_players` (\n\t`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,\n\t`backend_id` text NOT NULL,\n\t`normalized_username` text NOT NULL,\n\t`display_name` text NOT NULL,\n\t`created_at` text NOT NULL,\n\t`updated_at` text NOT NULL\n);\n--> statement-breakpoint\nCREATE UNIQUE INDEX `tracked_players_backend_id_unique` ON `tracked_players` (`backend_id`);\n--> statement-breakpoint\nCREATE UNIQUE INDEX `tracked_players_normalized_username_unique` ON `tracked_players` (`normalized_username`);",
  },
};

export default migrations;
