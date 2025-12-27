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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'qualifyiq_profiles_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'qualifyiq_organizations'
            referencedColumns: ['id']
          }
        ]
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
          follow_up_date: string | null
          follow_up_notes: string | null
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
          follow_up_date?: string | null
          follow_up_notes?: string | null
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
          follow_up_date?: string | null
          follow_up_notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'qualifyiq_leads_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'qualifyiq_organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'qualifyiq_leads_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'qualifyiq_profiles'
            referencedColumns: ['id']
          }
        ]
      }
      qualifyiq_scorecards: {
        Row: {
          id: string
          lead_id: string
          organization_id: string
          budget_score: number | null
          budget_notes: string | null
          authority_score: number | null
          authority_notes: string | null
          need_score: number | null
          need_notes: string | null
          timeline_score: number | null
          timeline_notes: string | null
          technical_fit_score: number | null
          technical_fit_notes: string | null
          red_flags: Json
          weighted_score: number | null
          recommendation: 'go' | 'review' | 'no_go' | null
          overall_notes: string | null
          // AI Analysis fields
          ai_company_analysis: Json | null
          ai_suggestions: Json | null
          ai_confidence: number | null
          ai_analysis_timestamp: string | null
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
          // AI Analysis fields
          ai_company_analysis?: Json | null
          ai_suggestions?: Json | null
          ai_confidence?: number | null
          ai_analysis_timestamp?: string | null
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
          // AI Analysis fields
          ai_company_analysis?: Json | null
          ai_suggestions?: Json | null
          ai_confidence?: number | null
          ai_analysis_timestamp?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'qualifyiq_scorecards_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'qualifyiq_leads'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'qualifyiq_scorecards_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'qualifyiq_organizations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'qualifyiq_scorecards_created_by_fkey'
            columns: ['created_by']
            referencedRelation: 'qualifyiq_profiles'
            referencedColumns: ['id']
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: 'qualifyiq_scoring_configs_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'qualifyiq_organizations'
            referencedColumns: ['id']
          }
        ]
      }
      qualifyiq_lead_notes: {
        Row: {
          id: string
          lead_id: string
          organization_id: string
          content: string
          note_type: 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'outcome'
          ai_generated: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          organization_id: string
          content: string
          note_type?: 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'outcome'
          ai_generated?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          organization_id?: string
          content?: string
          note_type?: 'note' | 'call' | 'email' | 'meeting' | 'status_change' | 'outcome'
          ai_generated?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'qualifyiq_lead_notes_lead_id_fkey'
            columns: ['lead_id']
            referencedRelation: 'qualifyiq_leads'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'qualifyiq_lead_notes_organization_id_fkey'
            columns: ['organization_id']
            referencedRelation: 'qualifyiq_organizations'
            referencedColumns: ['id']
          }
        ]
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
        Relationships: []
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types - using prefixed table names
export type Organization = Database['public']['Tables']['qualifyiq_organizations']['Row']
export type Profile = Database['public']['Tables']['qualifyiq_profiles']['Row']
export type Lead = Database['public']['Tables']['qualifyiq_leads']['Row']
export type Scorecard = Database['public']['Tables']['qualifyiq_scorecards']['Row']
export type ScoringConfig = Database['public']['Tables']['qualifyiq_scoring_configs']['Row']
export type LeadNote = Database['public']['Tables']['qualifyiq_lead_notes']['Row']

export type LeadInsert = Database['public']['Tables']['qualifyiq_leads']['Insert']
export type ScorecardInsert = Database['public']['Tables']['qualifyiq_scorecards']['Insert']
export type LeadNoteInsert = Database['public']['Tables']['qualifyiq_lead_notes']['Insert']
export type ScorecardUpdate = Database['public']['Tables']['qualifyiq_scorecards']['Update']
export type LeadUpdate = Database['public']['Tables']['qualifyiq_leads']['Update']

// Lead with score info from view
export type LeadWithScore = Database['public']['Views']['qualifyiq_leads_with_scores']['Row']

// AI Analysis types
export interface AICompanyAnalysis {
  companySize: 'startup' | 'pyme' | 'midmarket' | 'enterprise' | 'unknown'
  employeeEstimate: string
  industry: string[]
  revenueEstimate: string
  buyingSignals: string[]
  potentialRedFlags: string[]
  suggestedBANT: {
    budget: number | null
    authority: number | null
    need: number | null
    timeline: number | null
    technicalFit: number | null
  }
  discoveryQuestions: string[]
  confidence: number
}

export interface AISuggestions {
  bantScores: {
    budget?: number
    authority?: number
    need?: number
    timeline?: number
    technicalFit?: number
  }
  redFlagsToAdd: string[]
  notes: string
}
