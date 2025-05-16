import { describe, it, expect, vi, beforeEach } from "vitest";

// -------------------------------------------------------------------------
// Third-party stubs that are required by the modules under test
// -------------------------------------------------------------------------
vi.mock("@sentry/react", () => ({
  captureException: vi.fn(),
  setUser: vi.fn(),
}));

// -------------------------------------------------------------------------
// Local imports (done *after* external mocks so dependency graph picks them up)
// -------------------------------------------------------------------------
import { saveMessage } from "./messages.js";

// -------------------------------------------------------------------------
// Supabase client chain mock helpers
// -------------------------------------------------------------------------
let insertSpy: ReturnType<typeof vi.fn>;

vi.mock("@/integrations/supabase/client", () => {
  const single = vi
    .fn()
    .mockResolvedValue({ data: { id: "msg-uuid" }, error: null });
  const select = vi.fn(() => ({ single }));
  insertSpy = vi.fn(() => ({ select }));
  const from = vi.fn(() => ({ insert: insertSpy }));
  return { supabase: { from } };
});

vi.mock("@/utils/authCache", () => ({
  requireCurrentUser: () =>
    Promise.resolve({
      id: "user-uuid",
      email: "test@example.com",
    }),
}));

// -------------------------------------------------------------------------

describe("saveMessage()", () => {
  beforeEach(() => {
    insertSpy.mockClear();
  });

  it("persists the provided text and threadId", async () => {
    const text = "Reviewed text";
    const original = "Original text";
    const threadId = "thread-uuid";

    await saveMessage(text, threadId, original);

    expect(insertSpy).toHaveBeenCalledTimes(1);

    const [payload] = insertSpy.mock.calls[0];
    expect(payload).toMatchObject({
      text,
      thread_id: threadId,
    });
  });

  it("falls back to the optional selected argument when text is empty", async () => {
    insertSpy.mockClear();

    const selected = "Selected fallback";
    const threadId = "thread-uuid";

    await saveMessage("", threadId, selected);

    const [payload] = insertSpy.mock.calls[0];
    expect(payload.text).toBe(selected);
  });
});
