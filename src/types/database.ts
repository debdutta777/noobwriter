export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chapter_likes: {
        Row: {
          id: string
          user_id: string
          chapter_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chapter_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_id?: string
          created_at?: string
        }
        Relationships: []
      }
      chapter_unlocks: {
        Row: {
          id: string
          user_id: string
          chapter_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chapter_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_id?: string
          unlocked_at?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          id: string
          series_id: string
          chapter_number: number
          title: string
          slug: string
          content: string | null
          word_count: number | null
          page_count: number | null
          is_premium: boolean
          coin_price: number | null
          is_published: boolean
          published_at: string | null
          scheduled_at: string | null
          view_count: number
          created_at: string
          updated_at: string
          likes: number
          unlock_cost: number | null
        }
        Insert: {
          id?: string
          series_id: string
          chapter_number: number
          title: string
          slug: string
          content?: string | null
          word_count?: number | null
          page_count?: number | null
          is_premium?: boolean
          coin_price?: number | null
          is_published?: boolean
          published_at?: string | null
          scheduled_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
          likes?: number
          unlock_cost?: number | null
        }
        Update: {
          id?: string
          series_id?: string
          chapter_number?: number
          title?: string
          slug?: string
          content?: string | null
          word_count?: number | null
          page_count?: number | null
          is_premium?: boolean
          coin_price?: number | null
          is_published?: boolean
          published_at?: string | null
          scheduled_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
          likes?: number
          unlock_cost?: number | null
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          id: string
          user_id: string
          comment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comment_id?: string
          created_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          user_id: string
          series_id: string | null
          chapter_id: string | null
          parent_id: string | null
          content: string
          likes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          series_id?: string | null
          chapter_id?: string | null
          parent_id?: string | null
          content: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          series_id?: string | null
          chapter_id?: string | null
          parent_id?: string | null
          content?: string
          likes?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          series_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          series_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          series_id?: string
          created_at?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
        Relationships: []
      }
      manga_pages: {
        Row: {
          id: string
          chapter_id: string
          page_number: number
          image_url: string
          created_at: string
        }
        Insert: {
          id?: string
          chapter_id: string
          page_number: number
          image_url: string
          created_at?: string
        }
        Update: {
          id?: string
          chapter_id?: string
          page_number?: number
          image_url?: string
          created_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: string
          kyc_status: string | null
          notification_preferences: Json | null
          created_at: string
          updated_at: string
          social_links: Json | null
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: string
          kyc_status?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
          social_links?: Json | null
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: string
          kyc_status?: string | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
          social_links?: Json | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          id: string
          user_id: string
          series_id: string
          rating: number
          review: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          series_id: string
          rating: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          series_id?: string
          rating?: number
          review?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          chapter_id: string
          series_id: string
          progress_percentage: number
          last_read_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chapter_id: string
          series_id: string
          progress_percentage?: number
          last_read_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_id?: string
          series_id?: string
          progress_percentage?: number
          last_read_at?: string
          created_at?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          description: string | null
          cover_url: string | null
          content_type: string
          status: string
          genres: string[] | null
          tags: string[] | null
          language: string
          age_rating: string
          total_chapters: number
          total_views: number
          total_favorites: number
          average_rating: number | null
          is_featured: boolean
          published_at: string | null
          created_at: string
          updated_at: string
          total_comments: number
          is_published: boolean
          synopsis: string | null
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          description?: string | null
          cover_url?: string | null
          content_type: string
          status?: string
          genres?: string[] | null
          tags?: string[] | null
          language?: string
          age_rating?: string
          total_chapters?: number
          total_views?: number
          total_favorites?: number
          average_rating?: number | null
          is_featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
          total_comments?: number
          is_published?: boolean
          synopsis?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          description?: string | null
          cover_url?: string | null
          content_type?: string
          status?: string
          genres?: string[] | null
          tags?: string[] | null
          language?: string
          age_rating?: string
          total_chapters?: number
          total_views?: number
          total_favorites?: number
          average_rating?: number | null
          is_featured?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
          total_comments?: number
          is_published?: boolean
          synopsis?: string | null
        }
        Relationships: []
      }
      series_followers: {
        Row: {
          id: string
          user_id: string
          series_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          series_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          series_id?: string
          created_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          start_date: string
          end_date: string
          auto_renew: boolean
          razorpay_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          start_date: string
          end_date: string
          auto_renew?: boolean
          razorpay_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          start_date?: string
          end_date?: string
          auto_renew?: boolean
          razorpay_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: string
          amount: number
          coin_amount: number | null
          description: string
          reference_id: string | null
          reference_type: string | null
          payment_method: string | null
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          amount: number
          coin_amount?: number | null
          description: string
          reference_id?: string | null
          reference_type?: string | null
          payment_method?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          amount?: number
          coin_amount?: number | null
          description?: string
          reference_id?: string | null
          reference_type?: string | null
          payment_method?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          coin_balance: number
          total_earned: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          coin_balance?: number
          total_earned?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          coin_balance?: number
          total_earned?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_coins: {
        Args: {
          p_add_to_earned?: boolean
          p_amount: number
          p_user_id: string
        }
        Returns: unknown
      }
      add_coins_to_wallet: {
        Args: {
          p_coins: number
          p_user_id: string
        }
        Returns: unknown
      }
      deduct_coins: {
        Args: {
          p_amount: number
          p_user_id: string
        }
        Returns: unknown
      }
      deduct_coins_from_wallet: {
        Args: {
          p_coins: number
          p_user_id: string
        }
        Returns: unknown
      }
      increment_chapter_views: {
        Args: {
          p_chapter_id: string
        }
        Returns: unknown
      }
      increment_series_views: {
        Args: {
          p_series_id: string
        }
        Returns: unknown
      }
      process_tip: {
        Args: {
          p_amount: number
          p_chapter_id?: string
          p_recipient_id: string
          p_sender_id: string
          p_series_id?: string
        }
        Returns: unknown
      }
      unlock_premium_chapter: {
        Args: {
          p_author_id: string
          p_chapter_id: string
          p_price: number
          p_user_id: string
        }
        Returns: unknown
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
