import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { FeedController } from "./feed.controller";
import { FeedEventStoreService } from "./feed-event-store.service";

@Module({
  imports: [DatabaseModule],
  controllers: [FeedController],
  providers: [FeedEventStoreService],
})
export class FeedModule {}
