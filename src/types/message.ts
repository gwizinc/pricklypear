
export type Message = {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  
  // Fields for AI processing
  original_text?: string;
  kind_text?: string;
};
