export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      connections: {
        Row: {
          connected_user_id: string;
          created_at: string;
          id: string;
          status: Database["public"]["Enums"]["connection_status"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          connected_user_id: string;
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["connection_status"];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          connected_user_id?: string;
          created_at?: string;
          id?: string;
          status?: Database["public"]["Enums"]["connection_status"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "connections_connected_user_id_fkey";
            columns: ["connected_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "connections_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      message_read_receipts: {
        Row: {
          created_at: string;
          id: string;
          message_id: string;
          read_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message_id: string;
          read_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message_id?: string;
          read_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "message_read_receipts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          is_system: boolean | null;
          text: string | null;
          thread_id: string | null;
          timestamp: string | null;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          is_system?: boolean | null;
          text?: string | null;
          thread_id?: string | null;
          timestamp?: string | null;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          is_system?: boolean | null;
          text?: string | null;
          thread_id?: string | null;
          timestamp?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "threads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          id: string;
          message_tone: string | null;
          name: string;
          profile_emoji: string | null;
        };
        Insert: {
          created_at?: string;
          id: string;
          message_tone?: string | null;
          name: string;
          profile_emoji?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          message_tone?: string | null;
          name?: string;
          profile_emoji?: string | null;
        };
        Relationships: [];
      };
      thread_participants: {
        Row: {
          created_at: string | null;
          id: string;
          thread_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          thread_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          thread_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "thread_participants_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "threads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "thread_participants_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      threads: {
        Row: {
          created_at: string | null;
          id: string;
          status: string;
          summary: string | null;
          title: string;
          topic: Database["public"]["Enums"]["thread_topic"] | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          status?: string;
          summary?: string | null;
          title: string;
          topic?: Database["public"]["Enums"]["thread_topic"] | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          status?: string;
          summary?: string | null;
          title?: string;
          topic?: Database["public"]["Enums"]["thread_topic"] | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_thread: {
        Args: {
          title: string;
          topic: Database["public"]["Enums"]["thread_topic"];
          participant_ids?: string[];
        };
        Returns: string;
      };
      is_thread_participant: {
        Args: { thread_id: string; user_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      connection_status: "pending" | "accepted" | "declined" | "disabled";
      thread_topic:
        | "travel"
        | "parenting_time"
        | "health"
        | "education"
        | "activity"
        | "legal"
        | "other"
        | "expense";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      connection_status: ["pending", "accepted", "declined", "disabled"],
      thread_topic: [
        "travel",
        "parenting_time",
        "health",
        "education",
        "activity",
        "legal",
        "other",
        "expense",
      ],
    },
  },
} as const;
