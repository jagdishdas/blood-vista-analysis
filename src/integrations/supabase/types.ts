/**
 * UPDATED DATABASE TYPES
 * Generated from Supabase schema
 */

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
          full_name: string | null
          date_of_birth: string
          sex: 'male' | 'female' | 'other'
          pregnancy_status: boolean
          pregnancy_trimester: number | null
          chronic_conditions: string[]
          allergies: string[]
          current_medications: string[]
          family_history: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          date_of_birth: string
          sex: 'male' | 'female' | 'other'
          pregnancy_status?: boolean
          pregnancy_trimester?: number | null
          chronic_conditions?: string[]
          allergies?: string[]
          current_medications?: string[]
          family_history?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          date_of_birth?: string
          sex?: 'male' | 'female' | 'other'
          pregnancy_status?: boolean
          pregnancy_trimester?: number | null
          chronic_conditions?: string[]
          allergies?: string[]
          current_medications?: string[]
          family_history?: Json
          created_at?: string
          updated_at?: string
        }
      }
      blood_tests: {
        Row: {
          id: string
          user_id: string
          test_type: string
          test_date: string
          lab_name: string | null
          overall_risk: 'low' | 'moderate' | 'high' | 'critical' | null
          has_critical_values: boolean
          summary_en: string | null
          summary_ur: string | null
          relationship_flags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_type: string
          test_date: string
          lab_name?: string | null
          overall_risk?: 'low' | 'moderate' | 'high' | 'critical' | null
          has_critical_values?: boolean
          summary_en?: string | null
          summary_ur?: string | null
          relationship_flags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_type?: string
          test_date?: string
          lab_name?: string | null
          overall_risk?: 'low' | 'moderate' | 'high' | 'critical' | null
          has_critical_values?: boolean
          summary_en?: string | null
          summary_ur?: string | null
          relationship_flags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      test_parameters: {
        Row: {
          id: string
          test_id: string
          parameter_id: string
          parameter_name_en: string
          parameter_name_ur: string | null
          value: number
          unit: string
          ref_min: number
          ref_max: number
          status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH'
          deviation: number | null
          risk_level: 'low' | 'moderate' | 'high' | 'critical' | null
          flags: string[]
          interpretation_en: string | null
          interpretation_ur: string | null
          created_at: string
        }
        Insert: {
          id?: string
          test_id: string
          parameter_id: string
          parameter_name_en: string
          parameter_name_ur?: string | null
          value: number
          unit: string
          ref_min: number
          ref_max: number
          status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH'
          deviation?: number | null
          risk_level?: 'low' | 'moderate' | 'high' | 'critical' | null
          flags?: string[]
          interpretation_en?: string | null
          interpretation_ur?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          test_id?: string
          parameter_id?: string
          parameter_name_en?: string
          parameter_name_ur?: string | null
          value?: number
          unit?: string
          ref_min?: number
          ref_max?: number
          status?: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH'
          deviation?: number | null
          risk_level?: 'low' | 'moderate' | 'high' | 'critical' | null
          flags?: string[]
          interpretation_en?: string | null
          interpretation_ur?: string | null
          created_at?: string
        }
      }
      family_profiles: {
        Row: {
          id: string
          user_id: string
          relationship: string
          name: string | null
          conditions: string[]
          genetic_traits: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          relationship: string
          name?: string | null
          conditions?: string[]
          genetic_traits?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          relationship?: string
          name?: string | null
          conditions?: string[]
          genetic_traits?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      trend_snapshots: {
        Row: {
          id: string
          user_id: string
          parameter_id: string
          current_value: number
          previous_value: number | null
          percent_change: number | null
          trend_direction: 'improving' | 'stable' | 'worsening' | null
          current_date: string
          previous_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          parameter_id: string
          current_value: number
          previous_value?: number | null
          percent_change?: number | null
          trend_direction?: 'improving' | 'stable' | 'worsening' | null
          current_date: string
          previous_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          parameter_id?: string
          current_value?: number
          previous_value?: number | null
          percent_change?: number | null
          trend_direction?: 'improving' | 'stable' | 'worsening' | null
          current_date?: string
          previous_date?: string | null
          created_at?: string
        }
      }
      radiology_scans: {
        Row: {
          ai_provider: string | null
          analysis_summary: string | null
          confidence_score: number | null
          created_at: string
          file_name: string
          file_url: string | null
          findings: Json | null
          id: string
          scan_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_provider?: string | null
          analysis_summary?: string | null
          confidence_score?: number | null
          created_at?: string
          file_name: string
          file_url?: string | null
          findings?: Json | null
          id?: string
          scan_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_provider?: string | null
          analysis_summary?: string | null
          confidence_score?: number | null
          created_at?: string
          file_name?: string
          file_url?: string | null
          findings?: Json | null
          id?: string
          scan_type?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_trend: {
        Args: {
          p_user_id: string
          p_parameter_id: string
          p_current_value: number
          p_current_date: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
