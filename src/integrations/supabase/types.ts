export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bunks: {
        Row: {
          created_at: string | null
          display_name: string
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name: string
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      camper_session_stats: {
        Row: {
          camper_id: string
          created_at: string | null
          id: string
          session_id: string | null
          total_missions: number | null
          total_qualified_days: number | null
          updated_at: string | null
        }
        Insert: {
          camper_id: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          total_missions?: number | null
          total_qualified_days?: number | null
          updated_at?: string | null
        }
        Update: {
          camper_id?: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          total_missions?: number | null
          total_qualified_days?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camper_session_stats_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      camper_weekly_points: {
        Row: {
          camper_id: string
          created_at: string | null
          id: string
          missions_completed: number | null
          session_number: number
          total_points: number | null
          updated_at: string | null
          week_number: number
        }
        Insert: {
          camper_id: string
          created_at?: string | null
          id?: string
          missions_completed?: number | null
          session_number: number
          total_points?: number | null
          updated_at?: string | null
          week_number: number
        }
        Update: {
          camper_id?: string
          created_at?: string | null
          id?: string
          missions_completed?: number | null
          session_number?: number
          total_points?: number | null
          updated_at?: string | null
          week_number?: number
        }
        Relationships: []
      }
      campers: {
        Row: {
          access_code: string
          bunk_id: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          access_code: string
          bunk_id: string
          created_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          bunk_id?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campers_bunk_id_fkey"
            columns: ["bunk_id"]
            isOneToOne: false
            referencedRelation: "bunks"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string | null
          icon: string
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          sort_order: number | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          icon: string
          id: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          sort_order?: number | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          sort_order?: number | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      rank_thresholds: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          missions_required: number
          qualified_days_required: number
          rank_name: string
          rank_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          missions_required: number
          qualified_days_required: number
          rank_name: string
          rank_order: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          missions_required?: number
          qualified_days_required?: number
          rank_name?: string
          rank_order?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      session_config: {
        Row: {
          current_day: number
          current_session: number
          current_week: number
          id: number
          session_lengths: number[]
          updated_at: string | null
        }
        Insert: {
          current_day?: number
          current_session?: number
          current_week?: number
          id?: number
          session_lengths?: number[]
          updated_at?: string | null
        }
        Update: {
          current_day?: number
          current_session?: number
          current_week?: number
          id?: number
          session_lengths?: number[]
          updated_at?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          access_code: string
          bunk_id: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          access_code: string
          bunk_id: string
          created_at?: string | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          access_code?: string
          bunk_id?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_bunk_id_fkey"
            columns: ["bunk_id"]
            isOneToOne: false
            referencedRelation: "bunks"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          camper_id: string
          created_at: string | null
          date: string
          edit_request_reason: string | null
          edit_requested_at: string | null
          id: string
          missions: string[]
          rejected_at: string | null
          rejected_by: string | null
          session_id: string | null
          status: string
          submitted_at: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          camper_id: string
          created_at?: string | null
          date: string
          edit_request_reason?: string | null
          edit_requested_at?: string | null
          id: string
          missions: string[]
          rejected_at?: string | null
          rejected_by?: string | null
          session_id?: string | null
          status: string
          submitted_at: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          camper_id?: string
          created_at?: string | null
          date?: string
          edit_request_reason?: string | null
          edit_requested_at?: string | null
          id?: string
          missions?: string[]
          rejected_at?: string | null
          rejected_by?: string | null
          session_id?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_camper_id_fkey"
            columns: ["camper_id"]
            isOneToOne: false
            referencedRelation: "campers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          admin_password: string
          daily_required_missions: number
          daily_reset_hour: number
          id: number
          timezone: string
          updated_at: string | null
        }
        Insert: {
          admin_password?: string
          daily_required_missions?: number
          daily_reset_hour?: number
          id?: number
          timezone?: string
          updated_at?: string | null
        }
        Update: {
          admin_password?: string
          daily_required_missions?: number
          daily_reset_hour?: number
          id?: number
          timezone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      working_missions: {
        Row: {
          camper_id: string
          id: string
          missions: string[]
          updated_at: string | null
        }
        Insert: {
          camper_id: string
          id?: string
          missions?: string[]
          updated_at?: string | null
        }
        Update: {
          camper_id?: string
          id?: string
          missions?: string[]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "working_missions_camper_id_fkey"
            columns: ["camper_id"]
            isOneToOne: true
            referencedRelation: "campers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
