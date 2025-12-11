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
      elderly_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          preferred_name: string | null
          date_of_birth: string | null
          avatar_url: string | null
          phone_number: string
          secondary_phone: string | null
          email: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postal_code: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          medical_notes: string | null
          care_notes: string | null
          preferred_call_time: string
          timezone: string
          call_frequency: string
          is_active: boolean
          elevenlabs_agent_id: string | null
          language: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          preferred_name?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          phone_number: string
          secondary_phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          medical_notes?: string | null
          care_notes?: string | null
          preferred_call_time?: string
          timezone?: string
          call_frequency?: string
          is_active?: boolean
          elevenlabs_agent_id?: string | null
          language?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          preferred_name?: string | null
          date_of_birth?: string | null
          avatar_url?: string | null
          phone_number?: string
          secondary_phone?: string | null
          email?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          medical_notes?: string | null
          care_notes?: string | null
          preferred_call_time?: string
          timezone?: string
          call_frequency?: string
          is_active?: boolean
          elevenlabs_agent_id?: string | null
          language?: string
        }
      }
      calls: {
        Row: {
          id: string
          elderly_profile_id: string | null
          conversation_id: string | null
          agent_id: string | null
          status: string
          initiated_at: string | null
          started_at: string | null
          ended_at: string | null
          duration_secs: number | null
          termination_reason: string | null
          cost: number | null
          call_type: string
          created_at: string
        }
        Insert: {
          id?: string
          elderly_profile_id?: string | null
          conversation_id?: string | null
          agent_id?: string | null
          status?: string
          initiated_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          duration_secs?: number | null
          termination_reason?: string | null
          cost?: number | null
          call_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          elderly_profile_id?: string | null
          conversation_id?: string | null
          agent_id?: string | null
          status?: string
          initiated_at?: string | null
          started_at?: string | null
          ended_at?: string | null
          duration_secs?: number | null
          termination_reason?: string | null
          cost?: number | null
          call_type?: string
          created_at?: string
        }
      }
      call_transcripts: {
        Row: {
          id: string
          call_id: string | null
          role: string
          message: string
          timestamp_ms: number | null
          sequence_number: number
          created_at: string
        }
        Insert: {
          id?: string
          call_id?: string | null
          role: string
          message: string
          timestamp_ms?: number | null
          sequence_number: number
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string | null
          role?: string
          message?: string
          timestamp_ms?: number | null
          sequence_number?: number
          created_at?: string
        }
      }
      call_summaries: {
        Row: {
          id: string
          call_id: string | null
          transcript_summary: string | null
          call_successful: boolean | null
          mood_assessment: string | null
          health_mentions: Json
          needs_mentioned: Json
          key_topics: Json
          follow_up_required: boolean
          urgency_level: string
          raw_analysis: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          call_id?: string | null
          transcript_summary?: string | null
          call_successful?: boolean | null
          mood_assessment?: string | null
          health_mentions?: Json
          needs_mentioned?: Json
          key_topics?: Json
          follow_up_required?: boolean
          urgency_level?: string
          raw_analysis?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string | null
          transcript_summary?: string | null
          call_successful?: boolean | null
          mood_assessment?: string | null
          health_mentions?: Json
          needs_mentioned?: Json
          key_topics?: Json
          follow_up_required?: boolean
          urgency_level?: string
          raw_analysis?: Json | null
          created_at?: string
        }
      }
      issues: {
        Row: {
          id: string
          elderly_profile_id: string | null
          call_id: string | null
          title: string
          description: string | null
          category: string
          status: string
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          source: string
          confidence_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          elderly_profile_id?: string | null
          call_id?: string | null
          title: string
          description?: string | null
          category: string
          status?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          source?: string
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          elderly_profile_id?: string | null
          call_id?: string | null
          title?: string
          description?: string | null
          category?: string
          status?: string
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          source?: string
          confidence_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      schedule_overrides: {
        Row: {
          id: string
          elderly_profile_id: string | null
          override_date: string
          skip_call: boolean
          custom_time: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          elderly_profile_id?: string | null
          override_date: string
          skip_call?: boolean
          custom_time?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          elderly_profile_id?: string | null
          override_date?: string
          skip_call?: boolean
          custom_time?: string | null
          reason?: string | null
          created_at?: string
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

// Helper types
export type ElderlyProfile = Database['public']['Tables']['elderly_profiles']['Row']
export type ElderlyProfileInsert = Database['public']['Tables']['elderly_profiles']['Insert']
export type ElderlyProfileUpdate = Database['public']['Tables']['elderly_profiles']['Update']

export type Call = Database['public']['Tables']['calls']['Row']
export type CallInsert = Database['public']['Tables']['calls']['Insert']
export type CallUpdate = Database['public']['Tables']['calls']['Update']

export type CallTranscript = Database['public']['Tables']['call_transcripts']['Row']
export type CallSummary = Database['public']['Tables']['call_summaries']['Row']
export type Issue = Database['public']['Tables']['issues']['Row']
export type IssueInsert = Database['public']['Tables']['issues']['Insert']
export type IssueUpdate = Database['public']['Tables']['issues']['Update']

// Extended types with relations
export type ElderlyProfileWithStats = ElderlyProfile & {
  last_call?: Call | null
  open_issues_count?: number
}

export type CallWithDetails = Call & {
  elderly_profile?: ElderlyProfile | null
  call_summary?: CallSummary | null
}

export type IssueWithDetails = Issue & {
  elderly_profile?: ElderlyProfile | null
  call?: Call | null
}
