import type { Message } from "./message.js";

export type EphemeralThread = {
  id: string;
  createdAt: Date;
  title: string;
  messages: Message[];
};
