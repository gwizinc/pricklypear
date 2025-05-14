import React, { createContext, useContext, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";
import type { EphemeralThread } from "@/types/ephemeral-thread.js";
import type { Message } from "@/types/message.js";
import SearchThreadPanel from "@/components/search/search-thread-panel.js";

type State = {
  thread: EphemeralThread | null;
};

type Action =
  | { type: "CREATE_THREAD" }
  | { type: "ADD_USER_MESSAGE"; text: string }
  | { type: "ADD_SYSTEM_MESSAGE"; text: string; isStreaming?: boolean }
  | { type: "CLOSE_THREAD" };

const initialState: State = { thread: null };

/**
 * Creates a new, empty search thread object.
 *
 * @returns {EphemeralThread} Newly-initialised thread
 */
function createNewThread(): EphemeralThread {
  return {
    id: uuidv4(),
    createdAt: new Date(),
    title: "Search",
    messages: [],
  };
}

export function searchThreadReducer(state: State, action: Action): State {
  switch (action.type) {
    case "CREATE_THREAD": {
      if (state.thread) return state;
      return { thread: createNewThread() };
    }

    case "ADD_USER_MESSAGE": {
      const baseThread = state.thread ?? createNewThread();
      const userMsg: Message = {
        id: uuidv4(),
        text: action.text,
        sender: "you",
        timestamp: new Date(),
        isCurrentUser: true,
      };
      return {
        thread: { ...baseThread, messages: [...baseThread.messages, userMsg] },
      };
    }

    case "ADD_SYSTEM_MESSAGE": {
      if (!state.thread) return state;
      const sysMsg: Message = {
        id: uuidv4(),
        text: action.text,
        sender: "system",
        timestamp: new Date(),
        isSystem: true,
        isStreaming: action.isStreaming,
      };
      return {
        thread: {
          ...state.thread,
          messages: [...state.thread.messages, sysMsg],
        },
      };
    }

    case "CLOSE_THREAD":
      return { thread: null };

    default:
      return state;
  }
}

type ContextValue = {
  thread: EphemeralThread | null;
  createThread: () => void;
  addUserMessage: (text: string) => void;
  addSystemMessage: (args: { text: string; isStreaming?: boolean }) => void;
  closeThread: () => void;
};

const SearchThreadContext = createContext<ContextValue | undefined>(undefined);

export const SearchThreadProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(searchThreadReducer, initialState);

  const value: ContextValue = {
    thread: state.thread,
    createThread: () => dispatch({ type: "CREATE_THREAD" }),
    addUserMessage: (text) => dispatch({ type: "ADD_USER_MESSAGE", text }),
    addSystemMessage: ({ text, isStreaming }) =>
      dispatch({ type: "ADD_SYSTEM_MESSAGE", text, isStreaming }),
    closeThread: () => dispatch({ type: "CLOSE_THREAD" }),
  };

  return (
    <SearchThreadContext.Provider value={value}>
      {children}
      {/* Keep drawer mounted so it can slide in/out */}
      <SearchThreadPanel />
    </SearchThreadContext.Provider>
  );
};

export const useSearchThread = (): ContextValue => {
  const ctx = useContext(SearchThreadContext);
  if (!ctx) throw new Error("useSearchThread must be used within provider");
  return ctx;
};
