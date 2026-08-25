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
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          new_status: string | null
          notes: string | null
          previous_status: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          notes?: string | null
          previous_status?: string | null
        }
        Relationships: []
      }
      app_configuration: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_secret: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_secret?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_secret?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string | null
        }
        Relationships: []
      }
      beta_waitlist: {
        Row: {
          city: string | null
          confirmation_token: string
          confirmed_at: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          interest: string | null
          plan_interest: string | null
          referral_source: string | null
          status: string
        }
        Insert: {
          city?: string | null
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          interest?: string | null
          plan_interest?: string | null
          referral_source?: string | null
          status?: string
        }
        Update: {
          city?: string | null
          confirmation_token?: string
          confirmed_at?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          interest?: string | null
          plan_interest?: string | null
          referral_source?: string | null
          status?: string
        }
        Relationships: []
      }
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
          commission_amount: number
          created_at: string
          end_date: string
          experience_id: string | null
          gst_amount: number
          guests: number | null
          handling_charge: number
          host_id: string | null
          host_proposed_requests: string[]
          id: string
          message: string | null
          platform_fee: number
          provided_requests: string[]
          services: string[] | null
          special_requests: string[]
          start_date: string
          status: string | null
          total_price: number
          traveler_id: string
          traveler_status: string
          traveler_status_updated_at: string | null
        }
        Insert: {
          commission_amount?: number
          created_at?: string
          end_date: string
          experience_id?: string | null
          gst_amount?: number
          guests?: number | null
          handling_charge?: number
          host_id?: string | null
          host_proposed_requests?: string[]
          id?: string
          message?: string | null
          platform_fee?: number
          provided_requests?: string[]
          services?: string[] | null
          special_requests?: string[]
          start_date: string
          status?: string | null
          total_price?: number
          traveler_id: string
          traveler_status?: string
          traveler_status_updated_at?: string | null
        }
        Update: {
          commission_amount?: number
          created_at?: string
          end_date?: string
          experience_id?: string | null
          gst_amount?: number
          guests?: number | null
          handling_charge?: number
          host_id?: string | null
          host_proposed_requests?: string[]
          id?: string
          message?: string | null
          platform_fee?: number
          provided_requests?: string[]
          services?: string[] | null
          special_requests?: string[]
          start_date?: string
          status?: string | null
          total_price?: number
          traveler_id?: string
          traveler_status?: string
          traveler_status_updated_at?: string | null
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
      catalog_host_offerings: {
        Row: {
          addon_notes: string | null
          admin_notes: string | null
          available_from: string | null
          available_to: string | null
          catalog_id: string
          city: string
          created_at: string
          duration: string | null
          experience_id: string | null
          headline: string
          host_id: string
          host_notes: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          max_guests: number
          meeting_point: string | null
          photos: string[]
          price: number
          price_unit: string
          season_months: number[]
          status: string
          updated_at: string
        }
        Insert: {
          addon_notes?: string | null
          admin_notes?: string | null
          available_from?: string | null
          available_to?: string | null
          catalog_id: string
          city?: string
          created_at?: string
          duration?: string | null
          experience_id?: string | null
          headline?: string
          host_id: string
          host_notes?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          max_guests?: number
          meeting_point?: string | null
          photos?: string[]
          price?: number
          price_unit?: string
          season_months?: number[]
          status?: string
          updated_at?: string
        }
        Update: {
          addon_notes?: string | null
          admin_notes?: string | null
          available_from?: string | null
          available_to?: string | null
          catalog_id?: string
          city?: string
          created_at?: string
          duration?: string | null
          experience_id?: string | null
          headline?: string
          host_id?: string
          host_notes?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          max_guests?: number
          meeting_point?: string | null
          photos?: string[]
          price?: number
          price_unit?: string
          season_months?: number[]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_host_offerings_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "experience_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_host_offerings_experience_id_fkey"
            columns: ["experience_id"]
            isOneToOne: false
            referencedRelation: "experiences"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_blogs: {
        Row: {
          author: string | null
          body: string | null
          category: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_published: boolean
          read_time: string | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          read_time?: string | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          read_time?: string | null
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_channels: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          external_url: string | null
          icon: string | null
          id: string
          is_published: boolean
          member_count: number
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          member_count?: number
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          external_url?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          member_count?: number
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      cms_preview_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string
          id: string
          label: string | null
          last_viewed_at: string | null
          revoked: boolean
          token: string
          updated_at: string
          view_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          label?: string | null
          last_viewed_at?: string | null
          revoked?: boolean
          token?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string
          id?: string
          label?: string | null
          last_viewed_at?: string | null
          revoked?: boolean
          token?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      cms_stories: {
        Row: {
          author: string | null
          body: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_published: boolean
          location: string | null
          slug: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          author?: string | null
          body?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          slug: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          author?: string | null
          body?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          location?: string | null
          slug?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      cms_tips: {
        Row: {
          body: string | null
          category: string | null
          created_at: string
          created_by: string | null
          icon: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_notifications: {
        Row: {
          body_html: string | null
          created_at: string
          error: string | null
          id: string
          payload: Json | null
          recipient_email: string
          recipient_user_id: string | null
          sent_at: string | null
          sent_by: string | null
          status: string
          subject: string
          template_id: string | null
          template_name: string | null
          trigger_event: string | null
        }
        Insert: {
          body_html?: string | null
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json | null
          recipient_email: string
          recipient_user_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject: string
          template_id?: string | null
          template_name?: string | null
          trigger_event?: string | null
        }
        Update: {
          body_html?: string | null
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json | null
          recipient_email?: string
          recipient_user_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          status?: string
          subject?: string
          template_id?: string | null
          template_name?: string | null
          trigger_event?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_notifications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          subject: string
          updated_at: string
          updated_by: string | null
          variables: string[] | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject: string
          updated_at?: string
          updated_by?: string | null
          variables?: string[] | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          updated_at?: string
          updated_by?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      experience_catalog: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string
          difficulty: string | null
          gallery: string[]
          hero_image_url: string | null
          highlights: string[]
          id: string
          includes: string[]
          is_featured: boolean
          occasion_type: string | null
          price_max: number
          price_min: number
          reviewed_at: string | null
          reviewed_by: string | null
          season_label: string | null
          season_months: number[]
          slug: string
          sort_order: number
          status: string
          sub_category: string | null
          submitted_by: string | null
          summary: string
          title: string
          typical_duration: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category: string
          created_at?: string
          description?: string
          difficulty?: string | null
          gallery?: string[]
          hero_image_url?: string | null
          highlights?: string[]
          id?: string
          includes?: string[]
          is_featured?: boolean
          occasion_type?: string | null
          price_max?: number
          price_min?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          season_label?: string | null
          season_months?: number[]
          slug: string
          sort_order?: number
          status?: string
          sub_category?: string | null
          submitted_by?: string | null
          summary?: string
          title: string
          typical_duration?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string
          difficulty?: string | null
          gallery?: string[]
          hero_image_url?: string | null
          highlights?: string[]
          id?: string
          includes?: string[]
          is_featured?: boolean
          occasion_type?: string | null
          price_max?: number
          price_min?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          season_label?: string | null
          season_months?: number[]
          slug?: string
          sort_order?: number
          status?: string
          sub_category?: string | null
          submitted_by?: string | null
          summary?: string
          title?: string
          typical_duration?: string | null
          updated_at?: string
        }
        Relationships: []
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
          template_data: Json | null
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
          template_data?: Json | null
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
          template_data?: Json | null
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
          template_data: Json | null
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
          template_data?: Json | null
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
          template_data?: Json | null
          title?: string
          updated_at?: string
          valid_from?: string | null
          valid_to?: string | null
          vehicle_details?: Json | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          enabled_globally: boolean
          flag_key: string
          id: string
          label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled_globally?: boolean
          flag_key: string
          id?: string
          label: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled_globally?: boolean
          flag_key?: string
          id?: string
          label?: string
          updated_at?: string
        }
        Relationships: []
      }
      feed_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      feed_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "feed_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          likes_count: number
          location: string | null
          media_type: string
          media_url: string
          reel_review_notes: string | null
          reel_reviewed_at: string | null
          reel_reviewed_by: string | null
          reel_status: string
          removed_at: string | null
          removed_by: string | null
          removed_reason: string | null
          status: string
          tag_type: string | null
          tag_value: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          location?: string | null
          media_type?: string
          media_url: string
          reel_review_notes?: string | null
          reel_reviewed_at?: string | null
          reel_reviewed_by?: string | null
          reel_status?: string
          removed_at?: string | null
          removed_by?: string | null
          removed_reason?: string | null
          status?: string
          tag_type?: string | null
          tag_value?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          location?: string | null
          media_type?: string
          media_url?: string
          reel_review_notes?: string | null
          reel_reviewed_at?: string | null
          reel_reviewed_by?: string | null
          reel_status?: string
          removed_at?: string | null
          removed_by?: string | null
          removed_reason?: string | null
          status?: string
          tag_type?: string | null
          tag_value?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      form_controls: {
        Row: {
          audience: string
          category: string
          created_at: string
          description: string | null
          disabled_message: string
          enabled: boolean
          form_key: string
          id: string
          label: string
          route: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          audience: string
          category: string
          created_at?: string
          description?: string | null
          disabled_message?: string
          enabled?: boolean
          form_key: string
          id?: string
          label: string
          route: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          audience?: string
          category?: string
          created_at?: string
          description?: string | null
          disabled_message?: string
          enabled?: boolean
          form_key?: string
          id?: string
          label?: string
          route?: string
          updated_at?: string
          updated_by?: string | null
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
      host_addons: {
        Row: {
          created_at: string
          description: string | null
          emoji: string
          host_id: string
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji?: string
          host_id: string
          id?: string
          is_active?: boolean
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string
          host_id?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      host_applications: {
        Row: {
          admin_notes: string | null
          bio: string | null
          city: string
          created_at: string
          email: string
          food_details: Json
          full_name: string
          homestay_details: Json
          id: string
          languages: string[]
          phone: string
          photos: string[]
          price_per_day: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          services: string[]
          specialties: string[]
          state: string
          status: string
          tagline: string | null
          transport_details: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          bio?: string | null
          city: string
          created_at?: string
          email: string
          food_details?: Json
          full_name: string
          homestay_details?: Json
          id?: string
          languages?: string[]
          phone: string
          photos?: string[]
          price_per_day?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          services?: string[]
          specialties?: string[]
          state: string
          status?: string
          tagline?: string | null
          transport_details?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          bio?: string | null
          city?: string
          created_at?: string
          email?: string
          food_details?: Json
          full_name?: string
          homestay_details?: Json
          id?: string
          languages?: string[]
          phone?: string
          photos?: string[]
          price_per_day?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          services?: string[]
          specialties?: string[]
          state?: string
          status?: string
          tagline?: string | null
          transport_details?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      host_dishes: {
        Row: {
          allergen_notes: string | null
          availability: string | null
          created_at: string
          cuisine: string
          description: string
          dietary_tags: string[]
          host_id: string
          id: string
          meal_type: string
          name: string
          photos: string[]
          prep_time: string | null
          price_per_plate: number
          serves: number
          status: string
          updated_at: string
        }
        Insert: {
          allergen_notes?: string | null
          availability?: string | null
          created_at?: string
          cuisine: string
          description: string
          dietary_tags?: string[]
          host_id: string
          id?: string
          meal_type: string
          name: string
          photos?: string[]
          prep_time?: string | null
          price_per_plate?: number
          serves?: number
          status?: string
          updated_at?: string
        }
        Update: {
          allergen_notes?: string | null
          availability?: string | null
          created_at?: string
          cuisine?: string
          description?: string
          dietary_tags?: string[]
          host_id?: string
          id?: string
          meal_type?: string
          name?: string
          photos?: string[]
          prep_time?: string | null
          price_per_plate?: number
          serves?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      host_eligibility: {
        Row: {
          admin_notes: string | null
          badge: string
          city: string
          country_focus: string[] | null
          created_at: string
          cultural_training: boolean
          eligibility_score: number
          email: string
          emergency_contact: string | null
          english_proficiency: string
          foreign_guests_hosted: number
          full_name: string
          has_kyc: boolean
          has_passport: boolean
          hosting_specialties: string[] | null
          id: string
          languages: string[] | null
          phone: string | null
          questionnaire_answers: Json
          questionnaire_score: number
          references_count: number
          reviewed_at: string | null
          reviewed_by: string | null
          social_links: Json
          social_score: number
          status: string
          updated_at: string
          user_id: string
          waitlist_position: number | null
          why_host: string | null
          years_hosting: number
        }
        Insert: {
          admin_notes?: string | null
          badge?: string
          city: string
          country_focus?: string[] | null
          created_at?: string
          cultural_training?: boolean
          eligibility_score?: number
          email: string
          emergency_contact?: string | null
          english_proficiency?: string
          foreign_guests_hosted?: number
          full_name: string
          has_kyc?: boolean
          has_passport?: boolean
          hosting_specialties?: string[] | null
          id?: string
          languages?: string[] | null
          phone?: string | null
          questionnaire_answers?: Json
          questionnaire_score?: number
          references_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json
          social_score?: number
          status?: string
          updated_at?: string
          user_id: string
          waitlist_position?: number | null
          why_host?: string | null
          years_hosting?: number
        }
        Update: {
          admin_notes?: string | null
          badge?: string
          city?: string
          country_focus?: string[] | null
          created_at?: string
          cultural_training?: boolean
          eligibility_score?: number
          email?: string
          emergency_contact?: string | null
          english_proficiency?: string
          foreign_guests_hosted?: number
          full_name?: string
          has_kyc?: boolean
          has_passport?: boolean
          hosting_specialties?: string[] | null
          id?: string
          languages?: string[] | null
          phone?: string | null
          questionnaire_answers?: Json
          questionnaire_score?: number
          references_count?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          social_links?: Json
          social_score?: number
          status?: string
          updated_at?: string
          user_id?: string
          waitlist_position?: number | null
          why_host?: string | null
          years_hosting?: number
        }
        Relationships: []
      }
      host_properties: {
        Row: {
          amenities: string[]
          availability: string | null
          check_in: string | null
          check_out: string | null
          created_at: string
          description: string
          host_id: string
          house_rules: string | null
          id: string
          location: string
          max_guests: number
          nightly_rate: number
          photos: string[]
          property_name: string
          property_type: string
          status: string
          updated_at: string
          weekly_rate: number
        }
        Insert: {
          amenities?: string[]
          availability?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          description: string
          host_id: string
          house_rules?: string | null
          id?: string
          location: string
          max_guests?: number
          nightly_rate?: number
          photos?: string[]
          property_name: string
          property_type: string
          status?: string
          updated_at?: string
          weekly_rate?: number
        }
        Update: {
          amenities?: string[]
          availability?: string | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          description?: string
          host_id?: string
          house_rules?: string | null
          id?: string
          location?: string
          max_guests?: number
          nightly_rate?: number
          photos?: string[]
          property_name?: string
          property_type?: string
          status?: string
          updated_at?: string
          weekly_rate?: number
        }
        Relationships: []
      }
      host_schedule_events: {
        Row: {
          city: string
          cover_image_url: string | null
          created_at: string
          description: string
          end_date: string | null
          event_type: string | null
          guest_capacity: number | null
          host_id: string
          id: string
          is_public: boolean
          kind: string
          recurring_months: number[]
          start_date: string | null
          status: string
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          city?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          event_type?: string | null
          guest_capacity?: number | null
          host_id: string
          id?: string
          is_public?: boolean
          kind?: string
          recurring_months?: number[]
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          city?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          event_type?: string | null
          guest_capacity?: number | null
          host_id?: string
          id?: string
          is_public?: boolean
          kind?: string
          recurring_months?: number[]
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      host_schedule_experiences: {
        Row: {
          catalog_id: string | null
          created_at: string
          id: string
          note: string | null
          offering_id: string | null
          schedule_id: string
        }
        Insert: {
          catalog_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          offering_id?: string | null
          schedule_id: string
        }
        Update: {
          catalog_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          offering_id?: string | null
          schedule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "host_schedule_experiences_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "experience_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_schedule_experiences_offering_id_fkey"
            columns: ["offering_id"]
            isOneToOne: false
            referencedRelation: "catalog_host_offerings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "host_schedule_experiences_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "host_schedule_events"
            referencedColumns: ["id"]
          },
        ]
      }
      host_transports: {
        Row: {
          amenities: string[]
          availability: string | null
          capacity: number
          created_at: string
          description: string
          host_id: string
          id: string
          model: string
          photos: string[]
          price_per_day: number
          price_per_km: number
          service_radius_km: number
          status: string
          updated_at: string
          vehicle_type: string
        }
        Insert: {
          amenities?: string[]
          availability?: string | null
          capacity?: number
          created_at?: string
          description: string
          host_id: string
          id?: string
          model: string
          photos?: string[]
          price_per_day?: number
          price_per_km?: number
          service_radius_km?: number
          status?: string
          updated_at?: string
          vehicle_type: string
        }
        Update: {
          amenities?: string[]
          availability?: string | null
          capacity?: number
          created_at?: string
          description?: string
          host_id?: string
          id?: string
          model?: string
          photos?: string[]
          price_per_day?: number
          price_per_km?: number
          service_radius_km?: number
          status?: string
          updated_at?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      host_verification_applications: {
        Row: {
          created_at: string
          host_id: string
          id: string
          milestone_snapshot: Json
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          host_id: string
          id?: string
          milestone_snapshot?: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          host_id?: string
          id?: string
          milestone_snapshot?: Json
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      platform_settings: {
        Row: {
          created_at: string
          gst_percent: number
          handling_charge: number
          id: string
          platform_fee_percent: number
          singleton: boolean
          updated_at: string
          updated_by: string | null
          verification_applications_enabled: boolean
          verification_auto_approve: boolean
          verification_min_completed_bookings: number
          verification_min_listings: number
          verification_min_profile_score: number
          verification_min_rating: number
        }
        Insert: {
          created_at?: string
          gst_percent?: number
          handling_charge?: number
          id?: string
          platform_fee_percent?: number
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
          verification_applications_enabled?: boolean
          verification_auto_approve?: boolean
          verification_min_completed_bookings?: number
          verification_min_listings?: number
          verification_min_profile_score?: number
          verification_min_rating?: number
        }
        Update: {
          created_at?: string
          gst_percent?: number
          handling_charge?: number
          id?: string
          platform_fee_percent?: number
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
          verification_applications_enabled?: boolean
          verification_auto_approve?: boolean
          verification_min_completed_bookings?: number
          verification_min_listings?: number
          verification_min_profile_score?: number
          verification_min_rating?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          cover_url: string | null
          created_at: string
          email: string | null
          first_name: string
          host_since: string | null
          id: string
          interests: string[] | null
          is_public: boolean
          languages: string[]
          last_name: string | null
          nationality: string | null
          phone: string | null
          presence_status: string
          price_per_day: number
          response_time: string | null
          services: string[]
          social_links: Json
          specialties: string[]
          tagline: string | null
          travel_styles: string[] | null
          updated_at: string
          username: string | null
          verification_status: string
          years_hosting: number
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          host_since?: string | null
          id: string
          interests?: string[] | null
          is_public?: boolean
          languages?: string[]
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          presence_status?: string
          price_per_day?: number
          response_time?: string | null
          services?: string[]
          social_links?: Json
          specialties?: string[]
          tagline?: string | null
          travel_styles?: string[] | null
          updated_at?: string
          username?: string | null
          verification_status?: string
          years_hosting?: number
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          host_since?: string | null
          id?: string
          interests?: string[] | null
          is_public?: boolean
          languages?: string[]
          last_name?: string | null
          nationality?: string | null
          phone?: string | null
          presence_status?: string
          price_per_day?: number
          response_time?: string | null
          services?: string[]
          social_links?: Json
          specialties?: string[]
          tagline?: string | null
          travel_styles?: string[] | null
          updated_at?: string
          username?: string | null
          verification_status?: string
          years_hosting?: number
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
      site_settings: {
        Row: {
          created_at: string
          draft: Json
          id: string
          published: Json
          published_at: string | null
          published_by: string | null
          singleton: boolean
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          draft?: Json
          id?: string
          published?: Json
          published_at?: string | null
          published_by?: string | null
          singleton?: boolean
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          draft?: Json
          id?: string
          published?: Json
          published_at?: string | null
          published_by?: string | null
          singleton?: boolean
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      site_settings_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          note: string | null
          snapshot: Json
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          snapshot: Json
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          note?: string | null
          snapshot?: Json
          version?: number
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          badge: string | null
          billing_cycle: string
          created_at: string
          currency: string
          description: string | null
          features: string[] | null
          id: string
          is_active: boolean
          name: string
          perks: Json | null
          price: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          billing_cycle?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          name: string
          perks?: Json | null
          price?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          billing_cycle?: string
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          is_active?: boolean
          name?: string
          perks?: Json | null
          price?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      traveler_stamps: {
        Row: {
          category: string
          created_at: string
          earned_at: string
          id: string
          metadata: Json
          progress: number
          stamp_key: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json
          progress?: number
          stamp_key: string
          tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          earned_at?: string
          id?: string
          metadata?: Json
          progress?: number
          stamp_key?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_bookmarks: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_feature_flags: {
        Row: {
          flag_key: string
          granted_at: string
          granted_by: string
          id: string
          user_id: string
        }
        Insert: {
          flag_key: string
          granted_at?: string
          granted_by: string
          id?: string
          user_id: string
        }
        Update: {
          flag_key?: string
          granted_at?: string
          granted_by?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding_progress: {
        Row: {
          completed_steps: string[]
          created_at: string
          dismissed: boolean
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: string[]
          created_at?: string
          dismissed?: boolean
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: string[]
          created_at?: string
          dismissed?: boolean
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      wedding_events: {
        Row: {
          city: string
          contact_phone: string | null
          couple_names: string
          cover_image_url: string | null
          created_at: string
          cuisines: string[] | null
          description: string | null
          guest_count: number | null
          highlights: string[] | null
          host_id: string
          id: string
          is_public: boolean
          status: string
          updated_at: string
          venue: string | null
          wedding_date: string
        }
        Insert: {
          city: string
          contact_phone?: string | null
          couple_names: string
          cover_image_url?: string | null
          created_at?: string
          cuisines?: string[] | null
          description?: string | null
          guest_count?: number | null
          highlights?: string[] | null
          host_id: string
          id?: string
          is_public?: boolean
          status?: string
          updated_at?: string
          venue?: string | null
          wedding_date: string
        }
        Update: {
          city?: string
          contact_phone?: string | null
          couple_names?: string
          cover_image_url?: string | null
          created_at?: string
          cuisines?: string[] | null
          description?: string | null
          guest_count?: number | null
          highlights?: string[] | null
          host_id?: string
          id?: string
          is_public?: boolean
          status?: string
          updated_at?: string
          venue?: string | null
          wedding_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_for_host_verification: {
        Args: never
        Returns: {
          created_at: string
          host_id: string
          id: string
          milestone_snapshot: Json
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "host_verification_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_host_application: {
        Args: { _application_id: string }
        Returns: {
          admin_notes: string | null
          badge: string
          city: string
          country_focus: string[] | null
          created_at: string
          cultural_training: boolean
          eligibility_score: number
          email: string
          emergency_contact: string | null
          english_proficiency: string
          foreign_guests_hosted: number
          full_name: string
          has_kyc: boolean
          has_passport: boolean
          hosting_specialties: string[] | null
          id: string
          languages: string[] | null
          phone: string | null
          questionnaire_answers: Json
          questionnaire_score: number
          references_count: number
          reviewed_at: string | null
          reviewed_by: string | null
          social_links: Json
          social_score: number
          status: string
          updated_at: string
          user_id: string
          waitlist_position: number | null
          why_host: string | null
          years_hosting: number
        }
        SetofOptions: {
          from: "*"
          to: "host_eligibility"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      approve_host_profile_application: {
        Args: { _application_id: string }
        Returns: {
          admin_notes: string | null
          bio: string | null
          city: string
          created_at: string
          email: string
          food_details: Json
          full_name: string
          homestay_details: Json
          id: string
          languages: string[]
          phone: string
          photos: string[]
          price_per_day: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          services: string[]
          specialties: string[]
          state: string
          status: string
          tagline: string | null
          transport_details: Json
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "host_applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      confirm_beta_waitlist: {
        Args: { _token: string }
        Returns: {
          confirmed_at: string
          email: string
          full_name: string
          plan_interest: string
          status: string
        }[]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_already_registered: { Args: { _email: string }; Returns: boolean }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_catalog_detail: { Args: { _identifier: string }; Returns: Json }
      get_catalog_public: {
        Args: never
        Returns: {
          avg_rating: number
          category: string
          cities: string[]
          difficulty: string
          hero_image_url: string
          highlights: string[]
          host_count: number
          id: string
          is_featured: boolean
          occasion_type: string
          offered_price_max: number
          offered_price_min: number
          price_max: number
          price_min: number
          season_label: string
          season_months: number[]
          slug: string
          sub_category: string
          summary: string
          title: string
          typical_duration: string
        }[]
      }
      get_host_onboarding_status: {
        Args: never
        Returns: {
          admin_approved: boolean
          application_status: string
          application_submitted: boolean
          assigned_role: string
          email_confirmed: boolean
          onboarding_complete: boolean
          reviewed_at: string
          role_matches_approval: boolean
          submitted_at: string
        }[]
      }
      get_host_schedule_public: { Args: { _host: string }; Returns: Json }
      get_my_role: { Args: never; Returns: string }
      get_public_host: { Args: { _identifier: string }; Returns: Json }
      get_public_host_directory: {
        Args: never
        Returns: {
          avatar_url: string
          bio: string
          city: string
          cover_url: string
          experiences_count: number
          full_name: string
          host_since: string
          id: string
          languages: string[]
          price_per_day: number
          rating: number
          response_time: string
          review_count: number
          services: string[]
          social_links: Json
          specialties: string[]
          tagline: string
          username: string
        }[]
      }
      get_public_profile: {
        Args: { _id: string }
        Returns: {
          avatar_url: string
          bio: string
          first_name: string
          id: string
          interests: string[]
          last_name: string
          nationality: string
          social_links: Json
          travel_styles: string[]
        }[]
      }
      get_public_profiles: {
        Args: { _ids: string[] }
        Returns: {
          avatar_url: string
          bio: string
          first_name: string
          id: string
          interests: string[]
          last_name: string
          nationality: string
          social_links: Json
          travel_styles: string[]
        }[]
      }
      get_public_wanderer: {
        Args: { _id: string }
        Returns: {
          badge: string
          bio: string
          city: string
          created_at: string
          full_name: string
          id: string
          missions_completed: number
          preferred_destinations: string[]
          score: number
          social_links: Json
          status: string
          total_videos: number
          travel_styles: string[]
          user_id: string
          video_url: string
        }[]
      }
      get_public_wanderers: {
        Args: never
        Returns: {
          badge: string
          bio: string
          city: string
          created_at: string
          full_name: string
          id: string
          missions_completed: number
          preferred_destinations: string[]
          score: number
          social_links: Json
          status: string
          total_videos: number
          travel_styles: string[]
          user_id: string
          video_url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      join_beta_waitlist: {
        Args: {
          _city?: string
          _email: string
          _full_name?: string
          _interest?: string
          _origin?: string
          _plan_interest?: string
          _referral_source?: string
        }
        Returns: {
          confirmation_token: string
          email: string
          full_name: string
          id: string
          plan_interest: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      repair_my_host_role: {
        Args: never
        Returns: {
          assigned_role: string
          message: string
          repaired: boolean
        }[]
      }
      resolve_cms_preview: { Args: { _token: string }; Returns: Json }
      review_host_verification: {
        Args: { _application_id: string; _notes?: string; _status: string }
        Returns: {
          created_at: string
          host_id: string
          id: string
          milestone_snapshot: Json
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "host_verification_applications"
          isOneToOne: true
          isSetofReturn: false
        }
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
