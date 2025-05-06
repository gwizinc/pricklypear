/**
 * Centralised definitions for all system-generated messages.
 * Each message can contain one or more `{placeholder}` tokens that will be
 * replaced at runtime via `formatSystemMessage`.
 */

export type SystemMessageKey =
  | "closeRequested"
  | "closeApproved"
  | "closeRejected"
  | "closeApprovedWithRequester"
  | "closeRejectedWithRequester";

interface SystemMessageDefinition {
  /**
   * Text containing `{placeholder}` tokens that must be supplied when calling
   * `formatSystemMessage`.
   */
  text: string;
  /** List of placeholders that are required for this message. */
  placeholders: readonly string[];
}

export const systemMessages: Record<SystemMessageKey, SystemMessageDefinition> = {
  closeRequested: {
    text: "{actor} has requested to close this thread.",
    placeholders: ["actor"],
  },
  closeApproved: {
    text: "{actor} approved closing this thread. The thread is now closed.",
    placeholders: ["actor"],
  },
  closeRejected: {
    text: "{actor} rejected the request to close this thread.",
    placeholders: ["actor"],
  },
  closeApprovedWithRequester: {
    text: "{actor} approved {requester}'s request to close this thread.",
    placeholders: ["actor", "requester"],
  },
  closeRejectedWithRequester: {
    text: "{actor} rejected {requester}'s request to close this thread.",
    placeholders: ["actor", "requester"],
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
