import {
  type ProgressEventCandidate,
  SKILL_LEVEL_UP_EVENT,
  TOTAL_LEVEL_MILESTONE_EVENT,
} from "../progress-events/progress-event.types";
import type { CanonicalPlayerSnapshot } from "./canonical-player-snapshot.types";

export type DiffCanonicalPlayerSnapshotsInput = {
  trackedPlayerId: string;
  previousSnapshotId: string | null;
  currentSnapshotId: string;
  previous: CanonicalPlayerSnapshot | null;
  current: CanonicalPlayerSnapshot;
  occurredAt: Date;
};

export function diffCanonicalPlayerSnapshots({
  trackedPlayerId,
  previousSnapshotId,
  currentSnapshotId,
  previous,
  current,
  occurredAt,
}: DiffCanonicalPlayerSnapshotsInput): ProgressEventCandidate[] {
  if (!previous) {
    return [];
  }

  const events: ProgressEventCandidate[] = [];

  for (const [skill, currentProgress] of Object.entries(current.skills)) {
    const previousProgress = previous.skills[skill];

    if (!previousProgress || currentProgress.level <= previousProgress.level) {
      continue;
    }

    events.push({
      trackedPlayerId,
      previousPlayerSnapshotId: previousSnapshotId,
      currentPlayerSnapshotId: currentSnapshotId,
      eventType: SKILL_LEVEL_UP_EVENT,
      subjectType: "skill",
      subjectKey: skill,
      fromValue: previousProgress.level,
      toValue: currentProgress.level,
      milestoneValue: null,
      occurredAt,
      idempotencyKey: `tracked-player:${trackedPlayerId}:skill-level-up:${skill}:${currentProgress.level}`,
      metadata: {},
    });
  }

  if (previous.overall && current.overall) {
    for (const milestone of crossedTotalLevelMilestones(
      previous.overall.level,
      current.overall.level,
    )) {
      events.push({
        trackedPlayerId,
        previousPlayerSnapshotId: previousSnapshotId,
        currentPlayerSnapshotId: currentSnapshotId,
        eventType: TOTAL_LEVEL_MILESTONE_EVENT,
        subjectType: "overall",
        subjectKey: "overall",
        fromValue: previous.overall.level,
        toValue: current.overall.level,
        milestoneValue: milestone,
        occurredAt,
        idempotencyKey: `tracked-player:${trackedPlayerId}:total-level-milestone:${milestone}`,
        metadata: {},
      });
    }
  }

  return events;
}

function crossedTotalLevelMilestones(
  previousLevel: number,
  currentLevel: number,
): number[] {
  if (currentLevel <= previousLevel) {
    return [];
  }

  const first = Math.ceil((previousLevel + 1) / 25) * 25;
  const milestones: number[] = [];

  for (let milestone = first; milestone <= currentLevel; milestone += 25) {
    milestones.push(milestone);
  }

  return milestones;
}
