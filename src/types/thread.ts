import type { ThreadTopic } from "@/constants/thread-topics";

export type ThreadStatus = "open" | "closed";

export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  status: ThreadStatus;
  participants: string[];
  summary?: string | null;
  topic: ThreadTopic | null;
};
