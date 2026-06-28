import {
  NEW_LOG_ITEM_EVENT,
  type ProgressEventCandidate,
  SKILL_LEVEL_UP_EVENT,
  TOTAL_LEVEL_MILESTONE_EVENT,
} from "./progress-event.types";

export type ProgressEventDisplayInput = {
  event: Pick<
    ProgressEventCandidate,
    "eventType" | "subjectKey" | "fromValue" | "toValue" | "milestoneValue"
  >;
  subjectLabel?: string | null;
};

export type ProgressEventDisplayProjection = {
  displayTitle: string;
  displayBody: string | null;
  displayAccentLabel: string;
  subjectLabel: string;
};

export function projectProgressEventDisplay({
  event,
  subjectLabel,
}: ProgressEventDisplayInput): ProgressEventDisplayProjection {
  if (event.eventType === SKILL_LEVEL_UP_EVENT) {
    const label = subjectLabel || humanizeKey(event.subjectKey);

    return {
      displayTitle: `reached ${event.toValue} ${label.toLowerCase()}`,
      displayBody: null,
      displayAccentLabel: "Skill",
      subjectLabel: label,
    };
  }

  if (event.eventType === TOTAL_LEVEL_MILESTONE_EVENT) {
    const milestone = event.milestoneValue ?? event.toValue;

    return {
      displayTitle: `reached ${milestone.toLocaleString("en-US")} total level`,
      displayBody: null,
      displayAccentLabel: "Total level",
      subjectLabel: subjectLabel || "Overall",
    };
  }

  if (event.eventType === NEW_LOG_ITEM_EVENT) {
    const label = subjectLabel || `item #${event.subjectKey}`;

    return {
      displayTitle: `added ${label} to the collection log`,
      displayBody: null,
      displayAccentLabel: "Collection log",
      subjectLabel: label,
    };
  }

  const fallbackLabel = subjectLabel || humanizeKey(event.subjectKey);

  return {
    displayTitle: `recorded ${fallbackLabel}`,
    displayBody: null,
    displayAccentLabel: "Activity",
    subjectLabel: fallbackLabel,
  };
}

export function humanizeKey(key: string): string {
  return key
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
