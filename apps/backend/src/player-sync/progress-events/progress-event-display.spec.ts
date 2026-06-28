import {
  NEW_LOG_ITEM_EVENT,
  SKILL_LEVEL_UP_EVENT,
  TOTAL_LEVEL_MILESTONE_EVENT,
} from "./progress-event.types";
import { projectProgressEventDisplay } from "./progress-event-display";

describe("projectProgressEventDisplay", () => {
  it("projects skill level-up copy", () => {
    expect(
      projectProgressEventDisplay({
        event: {
          eventType: SKILL_LEVEL_UP_EVENT,
          subjectKey: "slayer",
          fromValue: 87,
          toValue: 90,
          milestoneValue: null,
        },
      }),
    ).toEqual({
      displayTitle: "reached 90 slayer",
      displayBody: null,
      displayAccentLabel: "Skill",
      subjectLabel: "Slayer",
    });
  });

  it("projects total milestone copy", () => {
    expect(
      projectProgressEventDisplay({
        event: {
          eventType: TOTAL_LEVEL_MILESTONE_EVENT,
          subjectKey: "overall",
          fromValue: 1999,
          toValue: 2001,
          milestoneValue: 2000,
        },
      }),
    ).toEqual({
      displayTitle: "reached 2,000 total level",
      displayBody: null,
      displayAccentLabel: "Total level",
      subjectLabel: "Overall",
    });
  });

  it("projects collection-log item fallback copy", () => {
    expect(
      projectProgressEventDisplay({
        event: {
          eventType: NEW_LOG_ITEM_EVENT,
          subjectKey: "4151",
          fromValue: null,
          toValue: 1,
          milestoneValue: null,
        },
      }),
    ).toMatchObject({
      displayTitle: "added item #4151 to the collection log",
      displayBody: null,
      displayAccentLabel: "Collection log",
      subjectLabel: "item #4151",
    });
  });
});
