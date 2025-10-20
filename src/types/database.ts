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
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          role: 'reader' | 'writer' | 'admin'
          kyc_status: 'pending' | 'verified' | 'rejected' | null
          notification_preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'reader' | 'writer' | 'admin'
          kyc_status?: 'pending' | 'verified' | 'rejected' | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'reader' | 'writer' | 'admin'
          kyc_status?: 'pending' | 'verified' | 'rejected' | null
          notification_preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      series: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          description: string | null
          synopsis: string | null
          cover_url: string | null
          content_type: 'novel' | 'manga'
          status: 'ongoing' | 'completed' | 'hiatus'
          genres: string[]
          tags: string[]
          language: string
          age_rating: string
          total_chapters: number
          total_views: number
          total_favorites: number
          average_rating: number | null
          is_featured: boolean
          is_published: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          description?: string | null
          synopsis?: string | null
          cover_url?: string | null
          content_type: 'novel' | 'manga'
          status?: 'ongoing' | 'completed' | 'hiatus'
          genres?: string[]
          tags?: string[]
          language?: string
          age_rating?: string
          total_chapters?: number
          total_views?: number
          total_favorites?: number
          average_rating?: number | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          description?: string | null
          synopsis?: string | null
          cover_url?: string | null
          content_type?: 'novel' | 'manga'
          status?: 'ongoing' | 'completed' | 'hiatus'
          genres?: string[]
          tags?: string[]
          language?: string
          age_rating?: string
          total_chapters?: number
          total_views?: number
          total_favorites?: number
          average_rating?: number | null
          is_featured?: boolean
          is_published?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
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
        }
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
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'purchase' | 'unlock' | 'tip' | 'earning' | 'refund'
          amount: number
          coin_amount: number | null
          description: string
          reference_id: string | null
          reference_type: string | null
          payment_method: string | null
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'purchase' | 'unlock' | 'tip' | 'earning' | 'refund'
          amount: number
          coin_amount?: number | null
          description: string
          reference_id?: string | null
          reference_type?: string | null
          payment_method?: string | null
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'purchase' | 'unlock' | 'tip' | 'earning' | 'refund'
          amount?: number
          coin_amount?: number | null
          description?: string
          reference_id?: string | null
          reference_type?: string | null
          payment_method?: string | null
          payment_status?: 'pending' | 'completed' | 'failed' | 'refunded'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          metadata?: Json | null
          created_at?: string
        }
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
      }
      comments: {
        Row: {
          id: string
          user_id: string
          chapter_id: string
          content: string
          parent_id: string | null
          likes_count: number
          is_moderated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chapter_id: string
          content: string
          parent_id?: string | null
          likes_count?: number
          is_moderated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_id?: string
          content?: string
          parent_id?: string | null
          likes_count?: number
          is_moderated?: boolean
          created_at?: string
          updated_at?: string
        }
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
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'cancelled' | 'expired'
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
          status?: 'active' | 'cancelled' | 'expired'
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
          status?: 'active' | 'cancelled' | 'expired'
          start_date?: string
          end_date?: string
          auto_renew?: boolean
          razorpay_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
