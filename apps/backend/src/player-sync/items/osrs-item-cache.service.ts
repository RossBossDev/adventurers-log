import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Kysely } from "kysely";
import { KYSELY_DB } from "../../database/database.tokens";
import type { DB } from "../../database/database.types";
import { OsrsWikiItemMappingProvider } from "./osrs-wiki-item-mapping.provider";

const ITEM_CACHE_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class OsrsItemCacheService {
  private readonly logger = new Logger(OsrsItemCacheService.name);

  constructor(
    @Inject(KYSELY_DB) private readonly db: Kysely<DB>,
    @Inject(OsrsWikiItemMappingProvider)
    private readonly itemMappingProvider: OsrsWikiItemMappingProvider,
  ) {}

  async refreshIfStale(now = new Date()): Promise<void> {
    const newest = await this.db
      .selectFrom("osrs_items")
      .select("updated_at")
      .orderBy("updated_at", "desc")
      .executeTakeFirst();

    if (
      newest &&
      now.getTime() - new Date(newest.updated_at).getTime() < ITEM_CACHE_TTL_MS
    ) {
      return;
    }

    const items = await this.itemMappingProvider.fetchItems();

    if (items.length === 0) {
      return;
    }

    await this.db
      .insertInto("osrs_items")
      .values(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          examine: item.examine,
          icon: item.icon,
          members: item.members,
          raw_mapping: item.raw,
          updated_at: now,
        })),
      )
      .onConflict((oc) =>
        oc.column("id").doUpdateSet((eb) => ({
          name: eb.ref("excluded.name"),
          examine: eb.ref("excluded.examine"),
          icon: eb.ref("excluded.icon"),
          members: eb.ref("excluded.members"),
          raw_mapping: eb.ref("excluded.raw_mapping"),
          updated_at: eb.ref("excluded.updated_at"),
        })),
      )
      .execute();

    this.logger.log(`Cached ${items.length} OSRS item mappings.`);
  }
}
