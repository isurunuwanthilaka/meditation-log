import { describe, expect, it } from "vitest";
import { computeGrid, computeStreaks, isWithinDays, median, relativeDayLabel } from "../lib/streak";

function dateKeyDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

describe("computeStreaks", () => {
  it("counts a run of consecutive qualifying days ending today", () => {
    const sessions = [0, 1, 2].map((d) => ({ date: dateKeyDaysAgo(d), minutes: 10 }));
    const { current } = computeStreaks(sessions, 5);
    expect(current).toBe(3);
  });

  it("does not break the streak when today has no session yet", () => {
    const sessions = [1, 2, 3].map((d) => ({ date: dateKeyDaysAgo(d), minutes: 10 }));
    const { current } = computeStreaks(sessions, 5);
    expect(current).toBe(3);
  });

  it("breaks the streak on a gap before today", () => {
    const sessions = [0, 2, 3].map((d) => ({ date: dateKeyDaysAgo(d), minutes: 10 }));
    const { current } = computeStreaks(sessions, 5);
    expect(current).toBe(1);
  });

  it("excludes sessions under the daily minimum", () => {
    const sessions = [{ date: dateKeyDaysAgo(0), minutes: 3 }];
    const { current } = computeStreaks(sessions, 5);
    expect(current).toBe(0);
  });

  it("finds the longest run even if it isn't the current one", () => {
    const sessions = [
      ...[10, 11, 12, 13].map((d) => ({ date: dateKeyDaysAgo(d), minutes: 10 })),
      { date: dateKeyDaysAgo(0), minutes: 10 },
    ];
    const { current, longest } = computeStreaks(sessions, 5);
    expect(current).toBe(1);
    expect(longest).toBe(4);
  });
});

describe("computeGrid", () => {
  it("ends on today and starts on a Sunday", () => {
    const grid = computeGrid([]);
    const last = grid[grid.length - 1];
    const first = grid[0];
    expect(last.date.toDateString()).toBe(new Date().toDateString());
    expect(first.date.getDay()).toBe(0);
  });

  it("carries minutes for a logged day", () => {
    const grid = computeGrid([{ date: dateKeyDaysAgo(0), minutes: 12 }]);
    expect(grid[grid.length - 1].minutes).toBe(12);
  });
});

describe("relativeDayLabel", () => {
  it("labels today, yesterday, and older days", () => {
    expect(relativeDayLabel(dateKeyDaysAgo(0))).toBe("Today");
    expect(relativeDayLabel(dateKeyDaysAgo(1))).toBe("Yesterday");
    expect(relativeDayLabel(dateKeyDaysAgo(4))).toBe("4 days ago");
  });
});

describe("isWithinDays", () => {
  it("includes today and excludes days outside the window", () => {
    expect(isWithinDays(dateKeyDaysAgo(0), 7)).toBe(true);
    expect(isWithinDays(dateKeyDaysAgo(6), 7)).toBe(true);
    expect(isWithinDays(dateKeyDaysAgo(7), 7)).toBe(false);
  });
});

describe("median", () => {
  it("returns 0 for an empty list", () => {
    expect(median([])).toBe(0);
  });

  it("returns the upper-middle value", () => {
    expect(median([5, 10, 15])).toBe(10);
    expect(median([5, 10])).toBe(10);
  });
});
