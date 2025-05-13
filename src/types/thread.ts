export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  participants?: string[]; // Populated from thread_participants table
  owner_id?: string;
  status: string;
  summary?: string | null;
  closeRequestedBy?: string | null; // Now a UUID reference to profiles.id
  topic:
    | "travel"
    | "parenting_time"
    | "health"
    | "education"
    | "activity"
    | "legal"
    | "other"
    | null;
};
