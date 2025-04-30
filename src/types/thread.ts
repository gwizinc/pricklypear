
export type Thread = {
  id: string;
  title: string;
  createdAt: Date;
  participants: string[];
  owner_id?: string;
  status: string;
};
