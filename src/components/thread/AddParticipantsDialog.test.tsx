import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddParticipantsDialog from "./AddParticipantsDialog";

const mockGetConnections = vi.fn();
const mockAddParticipants = vi.fn();

vi.mock("@/services/users/userService", () => ({
  getConnections: (...args: unknown[]) => mockGetConnections(...args),
}));

vi.mock("@/services/threadService", () => ({
  addParticipantsToThread: (...args: unknown[]) =>
    mockAddParticipants(...args),
}));

const threadId = "thread-1";

function renderDialog(currentParticipantNames: string[] = [], onAdded?: (n: string[]) => void) {
  render(
    <AddParticipantsDialog
      threadId={threadId}
      currentParticipantNames={currentParticipantNames}
      disabled={false}
      onAdded={onAdded}
    />,
  );
}

describe("<AddParticipantsDialog />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows connections list without current participants", async () => {
    mockGetConnections.mockResolvedValue([
      { id: "c-1", otherUserId: "u-alice", username: "alice", status: "accepted" },
      { id: "c-2", otherUserId: "u-bob",   username: "bob",   status: "accepted" },
      { id: "c-3", otherUserId: "u-eve",   username: "eve",   status: "pending" },
    ]);

    renderDialog(["alice"]);

    // open the dialog
    await userEvent.click(screen.getByLabelText(/add participant/i));

    expect(mockGetConnections).toHaveBeenCalledTimes(1);

    // bob should appear, alice should be filtered out
    expect(await screen.findByText("bob")).toBeInTheDocument();
    expect(screen.queryByText("alice")).toBeNull();
  });

  it("adds selected participants and invokes callbacks", async () => {
    mockGetConnections.mockResolvedValue([
      { id: "c-1", otherUserId: "u-bob",   username: "bob",   status: "accepted" },
      { id: "c-2", otherUserId: "u-carol", username: "carol", status: "accepted" },
    ]);
    mockAddParticipants.mockResolvedValue(true);
    const onAdded = vi.fn();

    renderDialog([], onAdded);

    await userEvent.click(screen.getByLabelText(/add participant/i));

    // select both connections
    await userEvent.click(await screen.findByText("bob"));
    await userEvent.click(screen.getByText("carol"));

    // click Add
    await userEvent.click(screen.getByRole("button", { name: /^add$/i }));

    await waitFor(() =>
      expect(mockAddParticipants).toHaveBeenCalledWith(threadId, [
        "u-bob",
        "u-carol",
      ]),
    );

    expect(onAdded).toHaveBeenCalledWith(["bob", "carol"]);
  });

  it("resets selection after dialog closes and reopens", async () => {
    mockGetConnections.mockResolvedValue([
      { id: "c-1", otherUserId: "u-bob", username: "bob", status: "accepted" },
    ]);

    renderDialog();

    // open
    await userEvent.click(screen.getByLabelText(/add participant/i));
    await userEvent.click(await screen.findByText("bob")); // select

    // close (click trigger again toggles)
    await userEvent.click(screen.getByLabelText(/add participant/i));

    // reopen
    await userEvent.click(screen.getByLabelText(/add participant/i));

    // checkbox should be unchecked
    const checkbox = await screen.findByLabelText(/select bob/i);
    expect((checkbox as HTMLInputElement).checked).toBe(false);
  });
});
