import { describe, it, expect, vi } from "vitest";
import { getMessages } from "./messages.js";

// --- mocks --------------------------------------------------------------- //
vi.mock("@/integrations/supabase/client", () => {
  // automatic chaining: from().select().eq().order()
  const order = vi.fn().mockResolvedValue({
    data: [
      {
        message_id: 1,
        text: '"Hello world"', // legacy wrapping quotes
        is_system: false,
        profile_name: "Alice",
        timestamp: new Date().toISOString(),
        thread_id: "thread-1",
        user_id: "alice-id",
      },
    ],
    error: null,
  });

  const eq = vi.fn(() => ({ order }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return { supabase: { from } };
});

vi.mock("@/utils/authCache", () => ({
  requireCurrentUser: () =>
    Promise.resolve({
      id: "current-user-id",
      email: "test@example.com",
    }),
}));

// ------------------------------------------------------------------------ //

describe("getMessages()", () => {
  it("returns messages with sanitized text", async () => {
    const messages = await getMessages("thread-1");
    expect(messages[0].text).toBe("Hello world"); // quotes removed
  });
});
