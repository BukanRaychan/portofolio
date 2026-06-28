export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      education: {
        Row: {
          degree: string
          description: string | null
          gpa: string | null
          id: string
          institution: string
          logo_url: string | null
          period: string | null
          sort_order: number
        }
        Insert: {
          degree: string
          description?: string | null
          gpa?: string | null
          id?: string
          institution: string
          logo_url?: string | null
          period?: string | null
          sort_order?: number
        }
        Update: {
          degree?: string
          description?: string | null
          gpa?: string | null
          id?: string
          institution?: string
          logo_url?: string | null
          period?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          avatar_url: string | null
          bio: string | null
          email: string
          hero_role: string
          hero_subtitle: string
          hero_title: string
          id: number
          interests: string[]
          name: string
          socials: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          email: string
          hero_role: string
          hero_subtitle: string
          hero_title: string
          id?: number
          interests?: string[]
          name: string
          socials?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          email?: string
          hero_role?: string
          hero_subtitle?: string
          hero_title?: string
          id?: number
          interests?: string[]
          name?: string
          socials?: Json
          updated_at?: string
        }
        Relationships: []
      }
      tech_stack: {
        Row: {
          id: string
          logo_url: string | null
          name: string
          needs_inversion: boolean
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          logo_url?: string | null
          name: string
          needs_inversion?: boolean
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          logo_url?: string | null
          name?: string
          needs_inversion?: boolean
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      works: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          images: string[]
          link: string | null
          period: string | null
          place: string | null
          place_logo_url: string | null
          position: string | null
          sort_order: number
          technologies: string[]
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          link?: string | null
          period?: string | null
          place?: string | null
          place_logo_url?: string | null
          position?: string | null
          sort_order?: number
          technologies?: string[]
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          link?: string | null
          period?: string | null
          place?: string | null
          place_logo_url?: string | null
          position?: string | null
          sort_order?: number
          technologies?: string[]
          title?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { is_admin: { Args: never; Returns: boolean } }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]
export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]

export type SiteSettings = Tables<"site_settings">
export type Education = Tables<"education">
export type TechStack = Tables<"tech_stack">
export type Work = Tables<"works">

export type Socials = {
  github?: string
  linkedin?: string
  instagram?: string
  tiktok?: string
  twitter?: string
}
