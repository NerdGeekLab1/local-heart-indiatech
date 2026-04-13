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
      beta_wanderers: {
        Row: {
          admin_notes: string | null
          badge: string | null
          bio: string | null
          city: string
          created_at: string
          email: string
          full_name: string
          id: string
          missions_completed: number | null
          phone: string | null
          preferred_destinations: string[] | null
          score: number | null
          social_links: Json | null
          status: string
          total_videos: number | null
          travel_styles: string[] | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          admin_notes?: string | null
          badge?: string | null
          bio?: string | null
          city: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          missions_completed?: number | null
          phone?: string | null
          preferred_destinations?: string[] | null
          score?: number | null
          social_links?: Json | null
          status?: string
          total_videos?: number | null
          travel_styles?: string[] | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          admin_notes?: string | null
          badge?: string | null
          bio?: string | null
          city?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          missions_completed?: number | null
          phone?: string | null
          preferred_destinations?: string[] | null
          score?: number | null
          social_links?: Json | null
          status?: string
          total_videos?: number | null
          travel_styles?: string[] | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
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
      invoices: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string
          host_id: string | null
          id: string
          invoice_number: string
          issued_at: string
          notes: string | null
          paid_at: string | null
          status: string
          tax_amount: number
          total_amount: number
          traveler_id: string
        }
        Insert: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          host_id?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          tax_amount?: number
          total_amount?: number
          traveler_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          host_id?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          notes?: string | null
          paid_at?: string | null
          status?: string
          tax_amount?: number
          total_amount?: number
          traveler_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
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
      referrals: {
        Row: {
          created_at: string
          id: string
          redeemed_at: string | null
          referral_code: string
          referred_id: string | null
          referrer_id: string
          reward_points: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          redeemed_at?: string | null
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          reward_points?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          redeemed_at?: string | null
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          reward_points?: number
          status?: string
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
      subscriptions: {
        Row: {
          amount: number
          auto_renew: boolean
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          is_active: boolean
          payment_method: string | null
          starts_at: string
          tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          auto_renew?: boolean
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          payment_method?: string | null
          starts_at?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_renew?: boolean
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          payment_method?: string | null
          starts_at?: string
          tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      travel_streaks: {
        Row: {
          booking_id: string | null
          completed: boolean
          created_at: string
          id: string
          month: string
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          completed?: boolean
          created_at?: string
          id?: string
          month: string
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          completed?: boolean
          created_at?: string
          id?: string
          month?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_streaks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
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
      trip_participants: {
        Row: {
          id: string
          joined_at: string
          status: string
          trip_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          status?: string
          trip_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          status?: string
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_participants_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          expires_at: string | null
          granted_at: string
          granted_by: string
          id: string
          permission: string
          user_id: string
        }
        Insert: {
          expires_at?: string | null
          granted_at?: string
          granted_by: string
          id?: string
          permission: string
          user_id: string
        }
        Update: {
          expires_at?: string | null
          granted_at?: string
          granted_by?: string
          id?: string
          permission?: string
          user_id?: string
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
      wanderer_missions: {
        Row: {
          assigned_by: string
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          destination: string
          id: string
          reward_points: number | null
          status: string
          title: string
          updated_at: string
          wanderer_id: string
        }
        Insert: {
          assigned_by: string
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          destination: string
          id?: string
          reward_points?: number | null
          status?: string
          title: string
          updated_at?: string
          wanderer_id: string
        }
        Update: {
          assigned_by?: string
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          destination?: string
          id?: string
          reward_points?: number | null
          status?: string
          title?: string
          updated_at?: string
          wanderer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wanderer_missions_wanderer_id_fkey"
            columns: ["wanderer_id"]
            isOneToOne: false
            referencedRelation: "beta_wanderers"
            referencedColumns: ["id"]
          },
        ]
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
      subscription_tier: "free" | "explorer" | "adventurer" | "nomad"
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
      subscription_tier: ["free", "explorer", "adventurer", "nomad"],
    },
  },
} as const
