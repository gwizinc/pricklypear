export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      connections: {
        Row: {
          connected_user_id: string
          created_at: string
          id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_connected_user_id_fkey"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "message_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "connections_connected_user_id_fkey"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "message_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_read_receipts: {
        Row: {
          created_at: string
          id: string
          message_id: string
          profile_id: string
          read_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          profile_id: string
          read_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          profile_id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "message_profiles"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "message_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "message_read_receipts_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: string | null
          id: string
          is_system: boolean | null
          kind_text: string
          selected_text: string
          sender_profile_id: string | null
          timestamp: string | null
        }
        Insert: {
          conversation_id?: string | null
          id?: string
          is_system?: boolean | null
          kind_text: string
          selected_text: string
          sender_profile_id?: string | null
          timestamp?: string | null
        }
        Update: {
          conversation_id?: string | null
          id?: string
          is_system?: boolean | null
          kind_text?: string
          selected_text?: string
          sender_profile_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "message_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          message_tone: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id: string
          message_tone?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          message_tone?: string | null
          name?: string
        }
        Relationships: []
      }
      thread_participants: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          thread_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          thread_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          thread_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thread_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "message_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "thread_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_participants_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          close_requested_by: string | null
          created_at: string | null
          id: string
          owner_id: string | null
          status: string
          summary: string | null
          title: string
          topic: Database["public"]["Enums"]["thread_topic"] | null
        }
        Insert: {
          close_requested_by?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          status?: string
          summary?: string | null
          title: string
          topic?: Database["public"]["Enums"]["thread_topic"] | null
        }
        Update: {
          close_requested_by?: string | null
          created_at?: string | null
          id?: string
          owner_id?: string | null
          status?: string
          summary?: string | null
          title?: string
          topic?: Database["public"]["Enums"]["thread_topic"] | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_close_requested_by_profile_id_fkey"
            columns: ["close_requested_by"]
            isOneToOne: false
            referencedRelation: "message_profiles"
            referencedColumns: ["profile_id"]
          },
          {
            foreignKeyName: "threads_close_requested_by_profile_id_fkey"
            columns: ["close_requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      message_profiles: {
        Row: {
          conversation_id: string | null
          is_system: boolean | null
          kind_text: string | null
          message_id: string | null
          profile_id: string | null
          profile_name: string | null
          selected_text: string | null
          timestamp: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_profile_id_by_name: {
        Args: { profile_name: string }
        Returns: string
      }
      is_thread_participant: {
        Args: { thread_id: string; user_id: string }
        Returns: boolean
      }
      is_thread_recent: {
        Args: { thread_created_at: string }
        Returns: boolean
      }
    }
    Enums: {
      connection_status: "pending" | "accepted" | "declined" | "disabled"
      thread_topic:
        | "travel"
        | "parenting_time"
        | "health"
        | "education"
        | "activity"
        | "legal"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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
      ],
    },
  },
} as const
