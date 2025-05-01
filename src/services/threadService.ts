
import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/thread";
import { v4 as uuidv4 } from "uuid";

export const createThread = async (title: string, participantNames: string[]): Promise<Thread | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
    // Create the thread first
    const threadId = uuidv4();
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .insert({
        id: threadId,
        title,
        created_at: new Date().toISOString(),
        owner_id: user.id,
        status: 'open',
        summary: null
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
        .from('profiles')
        .select('id')
        .eq('name', name)
        .single();
      
      return profileData?.id;
    });
    
    const participantIds = (await Promise.all(participantPromises)).filter(Boolean);
    
    // Add participants to the thread_participants table
    if (participantIds.length > 0) {
      const participantsToInsert = participantIds.map(profileId => ({
        thread_id: threadId,
        profile_id: profileId
      }));
      
      const { error: participantsError } = await supabase
        .from('thread_participants')
        .insert(participantsToInsert);
      
      if (participantsError) {
        console.error("Error adding thread participants:", participantsError);
      }
    }
    
    // Also add the thread owner as a participant if they're not already included
    const { error: ownerParticipantError } = await supabase
      .from('thread_participants')
      .insert({
        thread_id: threadId,
        profile_id: user.id
      })
      .select();
    
    if (ownerParticipantError && !ownerParticipantError.message.includes("duplicate")) {
      console.error("Error adding owner as participant:", ownerParticipantError);
    }

    // Return the thread with participant names
    return {
      id: threadData.id,
      title: threadData.title,
      createdAt: new Date(threadData.created_at),
      participants: participantNames, // Return the names for UI display
      status: threadData.status,
      summary: threadData.summary,
      owner_id: threadData.owner_id
    };
  } catch (error) {
    console.error("Exception creating thread:", error);
    return null;
  }
};

export const getThreads = async (): Promise<Thread[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return [];
    }
    
    // Get all threads the user participates in
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false });

    if (threadError) {
      console.error("Error fetching threads:", threadError);
      return [];
    }

    // For each thread, get the participants
    const threadsWithParticipants = await Promise.all((threadData || []).map(async (thread) => {
      // Get participant profiles for this thread
      const { data: participantsData } = await supabase
        .from('thread_participants')
        .select(`
          profiles:profile_id (
            id, name
          )
        `)
        .eq('thread_id', thread.id);
      
      // Extract participant names
      const participants = participantsData?.map(item => item.profiles?.name) || [];
      
      return {
        id: thread.id,
        title: thread.title,
        createdAt: new Date(thread.created_at),
        participants: participants.filter(Boolean) as string[],
        status: thread.status,
        summary: thread.summary,
        closeRequestedBy: thread.close_requested_by,
        owner_id: thread.owner_id
      };
    }));

    return threadsWithParticipants;
  } catch (error) {
    console.error("Exception fetching threads:", error);
    return [];
  }
};

export const getThread = async (threadId: string): Promise<Thread | null> => {
  try {
    // Get the thread
    const { data: threadData, error: threadError } = await supabase
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (threadError) {
      console.error("Error fetching thread:", threadError);
      return null;
    }

    // Get participants for this thread
    const { data: participantsData } = await supabase
      .from('thread_participants')
      .select(`
        profiles:profile_id (
          id, name
        )
      `)
      .eq('thread_id', threadId);
    
    // Extract participant names
    const participants = participantsData?.map(item => item.profiles?.name).filter(Boolean) || [];

    return {
      id: threadData.id,
      title: threadData.title,
      createdAt: new Date(threadData.created_at),
      participants: participants as string[],
      status: threadData.status,
      summary: threadData.summary,
      closeRequestedBy: threadData.close_requested_by,
      owner_id: threadData.owner_id
    };
  } catch (error) {
    console.error("Exception fetching thread:", error);
    return null;
  }
};

export const updateThreadSummary = async (threadId: string, summary: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('threads')
      .update({ summary })
      .eq('id', threadId);

    if (error) {
      console.error("Error updating thread summary:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception updating thread summary:", error);
    return false;
  }
};

export const requestCloseThread = async (threadId: string, requestedBy: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('threads')
      .update({ 
        close_requested_by: requestedBy 
      })
      .eq('id', threadId);

    if (error) {
      console.error("Error requesting thread closure:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception requesting thread closure:", error);
    return false;
  }
};

export const approveCloseThread = async (threadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('threads')
      .update({ 
        status: 'closed',
        close_requested_by: null 
      })
      .eq('id', threadId);

    if (error) {
      console.error("Error closing thread:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception closing thread:", error);
    return false;
  }
};

export const rejectCloseThread = async (threadId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('threads')
      .update({ 
        close_requested_by: null 
      })
      .eq('id', threadId);

    if (error) {
      console.error("Error rejecting thread closure:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Exception rejecting thread closure:", error);
    return false;
  }
};
