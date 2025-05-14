import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { formatThreadTimestamp } from "./formatTimestamp";

describe("formatThreadTimestamp", () => {
  beforeAll(() => {
    vi.useFakeTimers();
    // Wednesday, 14 May 2025 12:00 UTC
    vi.setSystemTime(new Date("2025-05-14T12:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("formats today's timestamps as 'hh:mm a'", () => {
    const date = new Date("2025-05-14T09:30:00Z");
    expect(formatThreadTimestamp(date)).toBe("09:30 AM");
  });

  it("formats yesterday's timestamps correctly", () => {
    const date = new Date("2025-05-13T15:45:00Z");
    expect(formatThreadTimestamp(date)).toBe("Yesterday, 03:45 PM");
  });

  it("formats other days this week correctly", () => {
    // Monday of the same ISO week
    const date = new Date("2025-05-12T08:15:00Z");
    expect(formatThreadTimestamp(date)).toBe("Mon, 08:15 AM");
  });

  it("formats older timestamps with full pattern", () => {
    const date = new Date("2025-05-04T11:00:00Z");
    expect(formatThreadTimestamp(date)).toBe("May 4, Sun 11:00 AM");
  });
});
