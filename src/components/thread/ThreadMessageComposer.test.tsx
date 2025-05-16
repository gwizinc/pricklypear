import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThreadMessageComposer from "./ThreadMessageComposer";

describe("ThreadMessageComposer", () => {
  it("shows tooltip on hover over plus icon", async () => {
    const user = userEvent.setup();
    render(
      <ThreadMessageComposer
        newMessage=""
        setNewMessage={() => {}}
        isSending={false}
        isThreadClosed={false}
        onSendMessage={() => {}}
      />,
    );

    const plusButton = screen.getByLabelText(/Add photo or document/i);
    await user.hover(plusButton);

    expect(
      await screen.findByText(/Add photo or document/i),
    ).toBeInTheDocument();
  });
});
