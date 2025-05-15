/**
 * Centralised definitions for all system-generated messages.
 * Each message can contain one or more `{placeholder}` tokens that will be
 * replaced at runtime via `formatSystemMessage`.
 */

import { z } from "zod";

export const systemMessageSchema = z.union([
  z.literal("userJoined"),
  z.literal("userLeft"),
  z.literal("threadCreated"),
  z.literal("threadClosed"),
  z.literal("messageEdited"),
  z.literal("messageDeleted"),
]);

export type SystemMessageKey = z.infer<typeof systemMessageSchema>;

export interface SystemMessageDefinition {
  /**
   * Text containing `{placeholder}` tokens that must be supplied when calling
   * `formatSystemMessage`.
   */
  text: string;
  /** List of placeholders that are required for this message. */
  placeholders: string[];
}

export const systemMessages: Record<SystemMessageKey, SystemMessageDefinition> = {
  userJoined: {
    text: "{actor} joined the conversation.",
    placeholders: ["actor"],
  },
  userLeft: {
    text: "{actor} left the conversation.",
    placeholders: ["actor"],
  },
  threadCreated: {
    text: "{actor} created this conversation.",
    placeholders: ["actor"],
  },
  threadClosed: {
    text: "This conversation has been closed.",
    placeholders: [],
  },
  messageEdited: {
    text: "{actor} edited their message.",
    placeholders: ["actor"],
  },
  messageDeleted: {
    text: "{actor} deleted their message.",
    placeholders: ["actor"],
  },
};

/**
 * Replace all placeholders in a system message definition with concrete values.
 *
 * @param key      The system-message key to format.
 * @param values   A map whose keys correspond to the placeholders required by
 *                 the chosen message definition.
 * @returns        Fully formatted message ready for persistence / display.
 * @throws         If a required placeholder value is missing.
 */
export function formatSystemMessage(
  key: SystemMessageKey,
  values: Record<string, string>,
): string {
  const definition = systemMessages[key];

  let formatted = definition.text;

  for (const placeholder of definition.placeholders) {
    const value = values[placeholder];
    if (typeof value === "undefined") {
      throw new Error(
        `Missing value for placeholder "${placeholder}" while formatting system message "${key}".`,
      );
    }

    formatted = formatted.replace(new RegExp(`{${placeholder}}`, "g"), value);
  }

  return formatted;
}
