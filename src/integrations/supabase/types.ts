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
      bookings: {
        Row: {
          created_at: string
          end_date: string
          experience_id: string | null
          guests: number | null
          host_id: string | null
          id: string
          message: string | null
          services: string[] | null
          start_date: string
          status: string | null
          total_price: number
          traveler_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          experience_id?: string | null
          guests?: number | null
          host_id?: string | null
          id?: string
          message?: string | null
          services?: string[] | null
          start_date: string
          status?: string | null
          total_price?: number
          traveler_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          experience_id?: string | null
          guests?: number | null
          host_id?: string | null
          id?: string
          message?: string | null
          services?: string[] | null
          start_date?: string
          status?: string | null
          total_price?: number
          traveler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      experience_requests: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string | null
          destination: string | null
          difficulty: string | null
          duration: string | null
          highlights: string[] | null
          host_id: string
          id: string
          image_url: string | null
          includes: string[] | null
          is_year_round: boolean | null
          last_booking_date: string | null
          location: string
          max_guests: number | null
          price: number
          reviewed_by: string | null
          status: string | null
          sub_category: string | null
          title: string
          valid_from: string | null
          valid_to: string | null
          vehicle_details: Json | null
          vehicle_type: string | null
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string
          description?: string | null
          destination?: string | null
          difficulty?: string | null
          duration?: string | null
          highlights?: string[] | null
          host_id: string
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_year_round?: boolean | null
          last_booking_date?: string | null
          location: string
          max_guests?: number | null
          price?: number
          reviewed_by?: string | null
          status?: string | null
          sub_category?: string | null
          title: string
          valid_from?: string | null
          valid_to?: string | null
          vehicle_details?: Json | null
          vehicle_type?: string | null
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string | null
          destination?: string | null
          difficulty?: string | null
          duration?: string | null
          highlights?: string[] | null
          host_id?: string
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_year_round?: boolean | null
          last_booking_date?: string | null
          location?: string
          max_guests?: number | null
          price?: number
          reviewed_by?: string | null
          status?: string | null
          sub_category?: string | null
          title?: string
          valid_from?: string | null
          valid_to?: string | null
          vehicle_details?: Json | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      experiences: {
        Row: {
          approved_by: string | null
          category: string
          created_at: string
          description: string | null
          destination: string | null
          difficulty: string | null
          duration: string | null
          group_size: string | null
          highlights: string[] | null
          host_city: string | null
          host_id: string | null
          host_name: string | null
          id: string
          image_url: string | null
          includes: string[] | null
          is_year_round: boolean | null
          last_booking_date: string | null
          location: string
          max_guests: number | null
          price: number
          rating: number | null
          review_count: number | null
          status: string | null
          sub_category: string | null
          title: string
          updated_at: string
          valid_from: string | null
          valid_to: string | null
          vehicle_details: Json | null
          vehicle_type: string | null
        }
        Insert: {
          approved_by?: string | null
          category: string
          created_at?: string
          description?: string | null
          destination?: string | null
          difficulty?: string | null
          duration?: string | null
          group_size?: string | null
          highlights?: string[] | null
          host_city?: string | null
          host_id?: string | null
          host_name?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_year_round?: boolean | null
          last_booking_date?: string | null
          location: string
          max_guests?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          status?: string | null
          sub_category?: string | null
          title: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
          vehicle_details?: Json | null
          vehicle_type?: string | null
        }
        Update: {
          approved_by?: string | null
          category?: string
          created_at?: string
          description?: string | null
          destination?: string | null
          difficulty?: string | null
          duration?: string | null
          group_size?: string | null
          highlights?: string[] | null
          host_city?: string | null
          host_id?: string | null
          host_name?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          is_year_round?: boolean | null
          last_booking_date?: string | null
          location?: string
          max_guests?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          status?: string | null
          sub_category?: string | null
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
          vehicle_details?: Json | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      grievances: {
        Row: {
          admin_notes: string | null
          against: string
          booking_id: string | null
          category: string
          created_at: string
          description: string
          filed_by: string
          id: string
          priority: string | null
          resolution: string | null
          resolved_by: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          against: string
          booking_id?: string | null
          category?: string
          created_at?: string
          description: string
          filed_by: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          against?: string
          booking_id?: string | null
          category?: string
          created_at?: string
          description?: string
          filed_by?: string
          id?: string
          priority?: string | null
          resolution?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grievances_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string
          id: string
          read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string
          id?: string
          read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          interests: string[] | null
          last_name: string | null
          nationality: string | null
          phone: string | null
          travel_styles: string[] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id: string
          interests?: string[] | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          travel_styles?: string[] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          interests?: string[] | null
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          travel_styles?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          experience_id: string | null
          has_video: boolean | null
          host_id: string | null
          id: string
          rating: number
          text: string | null
          traveler_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          experience_id?: string | null
          has_video?: boolean | null
          host_id?: string | null
          id?: string
          rating: number
          text?: string | null
          traveler_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          experience_id?: string | null
          has_video?: boolean | null
          host_id?: string | null
          id?: string
          rating?: number
          text?: string | null
          traveler_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_listings: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          destination: string | null
          duration: string | null
          end_date: string | null
          highlights: string[] | null
          id: string
          image_url: string | null
          includes_activities: boolean | null
          includes_food: boolean | null
          includes_stay: boolean | null
          includes_transport: boolean | null
          inclusions: string[] | null
          max_travelers: number | null
          nature: string
          price_model: string
          route: string | null
          start_date: string | null
          status: string | null
          title: string
          total_price: number
          trip_direction: string | null
          trip_type: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          destination?: string | null
          duration?: string | null
          end_date?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          includes_activities?: boolean | null
          includes_food?: boolean | null
          includes_stay?: boolean | null
          includes_transport?: boolean | null
          inclusions?: string[] | null
          max_travelers?: number | null
          nature?: string
          price_model?: string
          route?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          total_price?: number
          trip_direction?: string | null
          trip_type?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          destination?: string | null
          duration?: string | null
          end_date?: string | null
          highlights?: string[] | null
          id?: string
          image_url?: string | null
          includes_activities?: boolean | null
          includes_food?: boolean | null
          includes_stay?: boolean | null
          includes_transport?: boolean | null
          inclusions?: string[] | null
          max_travelers?: number | null
          nature?: string
          price_model?: string
          route?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          total_price?: number
          trip_direction?: string | null
          trip_type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "host" | "traveler"
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
    Enums: {
      app_role: ["admin", "host", "traveler"],
    },
  },
} as const
