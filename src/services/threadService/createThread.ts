import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/thread";
import type { ThreadTopic } from "@/constants/thread-topics";
import { v4 as uuidv4 } from "uuid";
import { requireCurrentUser } from "@/utils/authCache";

export const createThread = async (
  title: string,
  participantNames: string[],
  topic: ThreadTopic = "other",
): Promise<Thread | null> => {
  try {
    const user = await requireCurrentUser();

    // Create the thread first
    const threadId = uuidv4();
    const { data: threadData, error: threadError } = await supabase
      .from("threads")
      .insert({
        id: threadId,
        title,
        created_at: new Date().toISOString(),
        owner_id: user.id,
        status: "open",
        summary: null,
        topic,
      })
      .select()
      .single();

    if (threadError) {
      console.error("Error creating thread:", threadError);
      return null;
    }

    // Get profile IDs for all participants
    const participantPromises = participantNames.map(async (name) => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("name", name)
        .single();

      return profileData?.id;
    });

    const participantIds = (await Promise.all(participantPromises)).filter(
      Boolean,
    );

    // Add participants to the thread_participants table
    if (participantIds.length > 0) {
      const participantsToInsert = participantIds.map((profileId) => ({
        thread_id: threadId,
        profile_id: profileId,
      }));

      const { error: participantsError } = await supabase
        .from("thread_participants")
        .insert(participantsToInsert);

      if (participantsError) {
        console.error("Error adding thread participants:", participantsError);
      }
    }

    // Also add the thread owner as a participant if they're not already included
    const { error: ownerParticipantError } = await supabase
      .from("thread_participants")
      .insert({
        thread_id: threadId,
        profile_id: user.id,
      })
      .select();

    if (
      ownerParticipantError &&
      !ownerParticipantError.message.includes("duplicate")
    ) {
      console.error(
        "Error adding owner as participant:",
        ownerParticipantError,
      );
    }

    // Return the thread with participant names
    return {
      id: threadData.id,
      title: threadData.title,
      createdAt: new Date(threadData.created_at),
      participants: participantNames, // Return the names for UI display
      status: threadData.status,
      summary: threadData.summary,
      owner_id: threadData.owner_id,
      topic: threadData.topic,
    };
  } catch (error) {
    console.error("Exception creating thread:", error);
    return null;
  }
};
