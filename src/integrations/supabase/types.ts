export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chat_bookings: {
        Row: {
          contact_info: string | null
          contact_method: string | null
          context_explored: string | null
          core_values: string[] | null
          created_at: string
          customer_type: string | null
          desired_outcome: string | null
          id: string
          insight: string | null
          intention: string | null
          name: string | null
          offering: string | null
          raw_summary: Json | null
          support_type: string | null
          timing: string | null
          user_id: string | null
          value_explored: string | null
        }
        Insert: {
          contact_info?: string | null
          contact_method?: string | null
          context_explored?: string | null
          core_values?: string[] | null
          created_at?: string
          customer_type?: string | null
          desired_outcome?: string | null
          id?: string
          insight?: string | null
          intention?: string | null
          name?: string | null
          offering?: string | null
          raw_summary?: Json | null
          support_type?: string | null
          timing?: string | null
          user_id?: string | null
          value_explored?: string | null
        }
        Update: {
          contact_info?: string | null
          contact_method?: string | null
          context_explored?: string | null
          core_values?: string[] | null
          created_at?: string
          customer_type?: string | null
          desired_outcome?: string | null
          id?: string
          insight?: string | null
          intention?: string | null
          name?: string | null
          offering?: string | null
          raw_summary?: Json | null
          support_type?: string | null
          timing?: string | null
          user_id?: string | null
          value_explored?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          role: string | null
          service_interest: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          role?: string | null
          service_interest?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          role?: string | null
          service_interest?: string | null
        }
        Relationships: []
      }
      core_values: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          values: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          values?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          values?: string[]
        }
        Relationships: []
      }
      email_captures: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          source?: string | null
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          all_winners: Json | null
          area_of_life: string
          created_at: string | null
          duration_seconds: number | null
          final_six_values: Json
          id: string
          selection_counts: Json | null
          user_id: string | null
        }
        Insert: {
          all_winners?: Json | null
          area_of_life: string
          created_at?: string | null
          duration_seconds?: number | null
          final_six_values?: Json
          id?: string
          selection_counts?: Json | null
          user_id?: string | null
        }
        Update: {
          all_winners?: Json | null
          area_of_life?: string
          created_at?: string | null
          duration_seconds?: number | null
          final_six_values?: Json
          id?: string
          selection_counts?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          audience: string
          challenge: string | null
          created_at: string | null
          email: string | null
          experience: string | null
          id: string
          impact: string | null
          name: string
          photo_url: string | null
          rating: number | null
          role: string
          status: string
          testimonial_draft: string
        }
        Insert: {
          audience?: string
          challenge?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          impact?: string | null
          name: string
          photo_url?: string | null
          rating?: number | null
          role: string
          status?: string
          testimonial_draft: string
        }
        Update: {
          audience?: string
          challenge?: string | null
          created_at?: string | null
          email?: string | null
          experience?: string | null
          id?: string
          impact?: string | null
          name?: string
          photo_url?: string | null
          rating?: number | null
          role?: string
          status?: string
          testimonial_draft?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_avg_quiz_duration: { Args: never; Returns: number }
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
