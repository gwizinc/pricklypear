import { describe, expect, it } from "vitest";
import { searchThreadReducer } from "../search-thread-context.js";

describe("searchThreadReducer", () => {
  it("creates a thread", () => {
    const next = searchThreadReducer(
      { thread: null },
      { type: "CREATE_THREAD" },
    );
    expect(next.thread).not.toBeNull();
  });

  it("adds a user message", () => {
    const afterCreate = searchThreadReducer(
      { thread: null },
      { type: "CREATE_THREAD" },
    );
    const afterMsg = searchThreadReducer(afterCreate, {
      type: "ADD_USER_MESSAGE",
      text: "hello",
    });
    expect(afterMsg.thread?.messages.length).toBe(1);
    expect(afterMsg.thread?.messages[0].text).toBe("hello");
  });

  it("closes thread", () => {
    const open = searchThreadReducer(
      { thread: null },
      { type: "CREATE_THREAD" },
    );
    const closed = searchThreadReducer(open, { type: "CLOSE_THREAD" });
    expect(closed.thread).toBeNull();
  });
});
