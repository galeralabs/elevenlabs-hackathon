import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Call, CallWithDetails } from '@/types'

export const callKeys = {
  all: ['calls'] as const,
  lists: () => [...callKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...callKeys.lists(), filters] as const,
  details: () => [...callKeys.all, 'detail'] as const,
  detail: (id: string) => [...callKeys.details(), id] as const,
  byElderly: (elderlyId: string) => [...callKeys.all, 'elderly', elderlyId] as const,
}

export function useCalls(options?: { elderlyId?: string; status?: string; limit?: number }) {
  return useQuery({
    queryKey: callKeys.list(options ?? {}),
    queryFn: async () => {
      let query = supabase
        .from('calls')
        .select(`
          *,
          elderly_profile:elderly_profiles(*),
          call_summary:call_summaries(*)
        `)
        .order('initiated_at', { ascending: false })

      if (options?.elderlyId) {
        query = query.eq('elderly_profile_id', options.elderlyId)
      }

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as CallWithDetails[]
    },
  })
}

export function useCall(id: string) {
  return useQuery({
    queryKey: callKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          elderly_profile:elderly_profiles(*),
          call_summary:call_summaries(*),
          transcripts:call_transcripts(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as CallWithDetails & { transcripts: unknown[] }
    },
    enabled: !!id,
  })
}

export function useRecentCalls(limit: number = 10) {
  return useQuery({
    queryKey: callKeys.list({ recent: true, limit }),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          elderly_profile:elderly_profiles(id, first_name, last_name, phone_number),
          call_summary:call_summaries(transcript_summary, mood_assessment, follow_up_required)
        `)
        .order('initiated_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as CallWithDetails[]
    },
  })
}

export function useTodaysCalls() {
  return useQuery({
    queryKey: callKeys.list({ today: true }),
    queryFn: async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          elderly_profile:elderly_profiles(id, first_name, last_name, preferred_name, phone_number, preferred_call_time)
        `)
        .gte('initiated_at', today.toISOString())
        .lt('initiated_at', tomorrow.toISOString())
        .order('initiated_at', { ascending: true })

      if (error) throw error
      return data as (Call & { elderly_profile: unknown })[]
    },
  })
}

export function useElderlyCallHistory(elderlyId: string) {
  return useQuery({
    queryKey: callKeys.byElderly(elderlyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          *,
          call_summary:call_summaries(*)
        `)
        .eq('elderly_profile_id', elderlyId)
        .order('initiated_at', { ascending: false })

      if (error) throw error
      return data as CallWithDetails[]
    },
    enabled: !!elderlyId,
  })
}
