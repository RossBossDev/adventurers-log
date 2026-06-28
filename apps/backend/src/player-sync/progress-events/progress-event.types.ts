export const SKILL_LEVEL_UP_EVENT = "skill_level_up" as const;
export const TOTAL_LEVEL_MILESTONE_EVENT = "total_level_milestone" as const;
export const NEW_LOG_ITEM_EVENT = "new_log_item" as const;
export const QUEST_COMPLETE_EVENT = "quest_complete" as const;
export const DIARY_COMPLETE_EVENT = "diary_complete" as const;

export type ProgressEventType =
  | typeof SKILL_LEVEL_UP_EVENT
  | typeof TOTAL_LEVEL_MILESTONE_EVENT
  | typeof NEW_LOG_ITEM_EVENT
  | typeof QUEST_COMPLETE_EVENT
  | typeof DIARY_COMPLETE_EVENT;

export type ProgressEventSubjectType =
  | "skill"
  | "overall"
  | "item"
  | "boss"
  | "quest"
  | "diary";

export type ProgressEventCandidate = {
  trackedPlayerId: string;
  previousPlayerSnapshotId: string | null;
  currentPlayerSnapshotId: string;
  eventType: ProgressEventType;
  subjectType: ProgressEventSubjectType;
  subjectKey: string;
  fromValue: number | null;
  toValue: number;
  milestoneValue: number | null;
  occurredAt: Date;
  idempotencyKey: string;
  metadata: Record<string, unknown>;
};
