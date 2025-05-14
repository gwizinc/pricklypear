import { describe, expect, it } from "vitest";
import { replaceMessageReferences } from "../replace-message-references.js";

describe("replaceMessageReferences", () => {
  it("returns the same string for now", () => {
    const input = "See message #123";
    expect(replaceMessageReferences(input)).toBe(input);
  });
});
