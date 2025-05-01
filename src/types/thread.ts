
export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  participants?: string[]; // Now populated from thread_participants table
  owner_id?: string;
  status: string;
  summary?: string | null;
  closeRequestedBy?: string | null;
};
