
import { supabase } from "@/integrations/supabase/client";
import { Thread } from "@/types/thread";
import { v4 as uuidv4 } from "uuid";

export const createThread = async (title: string, participants: string[]): Promise<Thread | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error("No authenticated user found");
      return null;
    }
    
    const threadId = uuidv4();
    const { data, error } = await supabase
      .from('threads')
      .insert({
        id: threadId,
        title,
        participants,
        created_at: new Date().toISOString(),
        owner_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating thread:", error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at),
      participants: data.participants
    };
  } catch (error) {
    console.error("Exception creating thread:", error);
    return null;
  }
};

export const getThreads = async (): Promise<Thread[]> => {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching threads:", error);
      return [];
    }

    return (data || []).map(thread => ({
      id: thread.id,
      title: thread.title,
      createdAt: new Date(thread.created_at),
      participants: thread.participants
    }));
  } catch (error) {
    console.error("Exception fetching threads:", error);
    return [];
  }
};

export const getThread = async (threadId: string): Promise<Thread | null> => {
  try {
    const { data, error } = await supabase
      .from('threads')
      .select('*')
      .eq('id', threadId)
      .single();

    if (error) {
      console.error("Error fetching thread:", error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at),
      participants: data.participants
    };
  } catch (error) {
    console.error("Exception fetching thread:", error);
    return null;
  }
};
