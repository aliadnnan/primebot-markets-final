import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          created_at: string
          updated_at: string
          is_admin: boolean
        }
        Insert: {
          email: string
          full_name?: string | null
          is_admin?: boolean
        }
        Update: {
          full_name?: string | null
          updated_at?: string
          is_admin?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          bot_id: string
          bot_name: string
          bot_price: number
          payment_method: string
          transaction_id: string
          payment_proof_url: string | null
          status: 'pending_verification' | 'verified' | 'rejected' | 'delivered'
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          bot_id: string
          bot_name: string
          bot_price: number
          payment_method: string
          transaction_id: string
          payment_proof_url?: string | null
        }
        Update: {
          status?: 'pending_verification' | 'verified' | 'rejected' | 'delivered'
          rejection_reason?: string | null
          updated_at?: string
          payment_proof_url?: string | null
        }
      }
      bots: {
        Row: {
          id: string
          name: string
          type: string
          price: number
          description: string | null
          features: string[]
          created_at: string
        }
        Insert: {
          id: string
          name: string
          type: string
          price: number
          description?: string | null
          features?: string[]
        }
        Update: {
          name?: string
          type?: string
          price?: number
          description?: string | null
          features?: string[]
        }
      }
      payment_methods: {
        Row: {
          id: string
          name: string
          description: string | null
          account_number: string
          account_type: string
          instructions: string | null
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          account_number: string
          account_type: string
          instructions?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          account_number?: string
          account_type?: string
          instructions?: string | null
        }
      }
      video_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          description: string | null
          category_id: string
          video_url: string
          thumbnail_url: string | null
          published: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category_id: string
          video_url: string
          thumbnail_url?: string | null
          published?: boolean
          created_by: string
        }
        Update: {
          title?: string
          description?: string | null
          category_id?: string
          video_url?: string
          thumbnail_url?: string | null
          published?: boolean
          updated_at?: string
        }
      }
    }
  }
}

// Types for responses with joined data
export type OrderWithUser = Database['public']['Tables']['orders']['Row'] & {
  users: Database['public']['Tables']['users']['Row'] | null
}

export type UserProfile = Database['public']['Tables']['users']['Row']

// Video types
export type VideoCategory = Database['public']['Tables']['video_categories']['Row']
export type Video = Database['public']['Tables']['videos']['Row']
export type VideoWithCategory = Video & {
  video_categories?: VideoCategory | null
}
