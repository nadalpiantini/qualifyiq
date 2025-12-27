// Database types for Supabase - matches migration schema
// Tables prefixed with qualifyiq_ per sujeto10 convention
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
      qualifyiq_organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
      }
      qualifyiq_profiles: {
        Row: {
          id: string
          organization_id: string | null
          email: string
          full_name: string | null
          role: 'owner' | 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          email: string
          full_name?: string | null
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          email?: string
          full_name?: string | null
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      qualifyiq_leads: {
        Row: {
          id: string
          organization_id: string
          company_name: string
          contact_name: string | null
          contact_email: string | null
          contact_phone: string | null
          source: string | null
          notes: string | null
          status: 'pending' | 'qualified' | 'disqualified' | 'converted' | 'lost'
          recommendation: 'go' | 'review' | 'no_go' | null
          score: number | null
          outcome: 'great' | 'good' | 'neutral' | 'problematic' | 'terrible' | null
          outcome_notes: string | null
          outcome_recorded_at: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          company_name: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          source?: string | null
          notes?: string | null
          status?: 'pending' | 'qualified' | 'disqualified' | 'converted' | 'lost'
          recommendation?: 'go' | 'review' | 'no_go' | null
          score?: number | null
          outcome?: 'great' | 'good' | 'neutral' | 'problematic' | 'terrible' | null
          outcome_notes?: string | null
          outcome_recorded_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          company_name?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          source?: string | null
          notes?: string | null
          status?: 'pending' | 'qualified' | 'disqualified' | 'converted' | 'lost'
          recommendation?: 'go' | 'review' | 'no_go' | null
          score?: number | null
          outcome?: 'great' | 'good' | 'neutral' | 'problematic' | 'terrible' | null
          outcome_notes?: string | null
          outcome_recorded_at?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      qualifyiq_scorecards: {
        Row: {
          id: string
          lead_id: string
          organization_id: string
          // BANT Scores (1-5)
          budget_score: number | null
          budget_notes: string | null
          authority_score: number | null
          authority_notes: string | null
          need_score: number | null
          need_notes: string | null
          timeline_score: number | null
          timeline_notes: string | null
          // Technical Fit (1-5)
          technical_fit_score: number | null
          technical_fit_notes: string | null
          // Red Flags (JSON array)
          red_flags: Json
          // Calculated
          weighted_score: number | null
          recommendation: 'go' | 'review' | 'no_go' | null
          // Notes
          overall_notes: string | null
          // Metadata
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          organization_id: string
          budget_score?: number | null
          budget_notes?: string | null
          authority_score?: number | null
          authority_notes?: string | null
          need_score?: number | null
          need_notes?: string | null
          timeline_score?: number | null
          timeline_notes?: string | null
          technical_fit_score?: number | null
          technical_fit_notes?: string | null
          red_flags?: Json
          weighted_score?: number | null
          recommendation?: 'go' | 'review' | 'no_go' | null
          overall_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          organization_id?: string
          budget_score?: number | null
          budget_notes?: string | null
          authority_score?: number | null
          authority_notes?: string | null
          need_score?: number | null
          need_notes?: string | null
          timeline_score?: number | null
          timeline_notes?: string | null
          technical_fit_score?: number | null
          technical_fit_notes?: string | null
          red_flags?: Json
          weighted_score?: number | null
          recommendation?: 'go' | 'review' | 'no_go' | null
          overall_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      qualifyiq_scoring_configs: {
        Row: {
          id: string
          organization_id: string
          budget_weight: number
          authority_weight: number
          need_weight: number
          timeline_weight: number
          technical_fit_weight: number
          red_flag_penalty: number
          go_threshold: number
          review_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          budget_weight?: number
          authority_weight?: number
          need_weight?: number
          timeline_weight?: number
          technical_fit_weight?: number
          red_flag_penalty?: number
          go_threshold?: number
          review_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          budget_weight?: number
          authority_weight?: number
          need_weight?: number
          timeline_weight?: number
          technical_fit_weight?: number
          red_flag_penalty?: number
          go_threshold?: number
          review_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      qualifyiq_leads_with_scores: {
        Row: {
          id: string
          organization_id: string
          company_name: string
          contact_name: string | null
          contact_email: string | null
          status: string
          recommendation: string | null
          score: number | null
          budget_score: number | null
          authority_score: number | null
          need_score: number | null
          timeline_score: number | null
          technical_fit_score: number | null
          red_flags: Json | null
          weighted_score: number | null
          scorecard_created_at: string | null
          created_at: string
          updated_at: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types - using prefixed table names
export type Organization = Database['public']['Tables']['qualifyiq_organizations']['Row']
export type Profile = Database['public']['Tables']['qualifyiq_profiles']['Row']
export type Lead = Database['public']['Tables']['qualifyiq_leads']['Row']
export type Scorecard = Database['public']['Tables']['qualifyiq_scorecards']['Row']
export type ScoringConfig = Database['public']['Tables']['qualifyiq_scoring_configs']['Row']

export type LeadInsert = Database['public']['Tables']['qualifyiq_leads']['Insert']
export type ScorecardInsert = Database['public']['Tables']['qualifyiq_scorecards']['Insert']

// Lead with score info from view
export type LeadWithScore = Database['public']['Views']['qualifyiq_leads_with_scores']['Row']
