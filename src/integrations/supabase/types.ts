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
        ]
      }
      system_settings: {
        Row: {
          admin_password: string
          daily_required_missions: number
          id: number
          updated_at: string | null
        }
        Insert: {
          admin_password?: string
          daily_required_missions?: number
          id?: number
          updated_at?: string | null
        }
        Update: {
          admin_password?: string
          daily_required_missions?: number
          id?: number
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
    Enums: {},
  },
} as const
