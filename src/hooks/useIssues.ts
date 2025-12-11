import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Issue, IssueInsert, IssueUpdate, IssueWithDetails } from '@/types'

export const issueKeys = {
  all: ['issues'] as const,
  lists: () => [...issueKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...issueKeys.lists(), filters] as const,
  details: () => [...issueKeys.all, 'detail'] as const,
  detail: (id: string) => [...issueKeys.details(), id] as const,
  byElderly: (elderlyId: string) => [...issueKeys.all, 'elderly', elderlyId] as const,
}

export function useIssues(options?: {
  elderlyId?: string
  status?: string
  priority?: string
  limit?: number
}) {
  return useQuery({
    queryKey: issueKeys.list(options ?? {}),
    queryFn: async () => {
      let query = supabase
        .from('issues')
        .select(`
          *,
          elderly_profile:elderly_profiles(id, first_name, last_name, phone_number)
        `)
        .order('created_at', { ascending: false })

      if (options?.elderlyId) {
        query = query.eq('elderly_profile_id', options.elderlyId)
      }

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      if (options?.priority) {
        query = query.eq('priority', options.priority)
      }

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as IssueWithDetails[]
    },
  })
}

export function useOpenIssues(limit?: number) {
  return useQuery({
    queryKey: issueKeys.list({ status: 'open', limit }),
    queryFn: async () => {
      let query = supabase
        .from('issues')
        .select(`
          *,
          elderly_profile:elderly_profiles(id, first_name, last_name, phone_number)
        `)
        .eq('status', 'open')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data as IssueWithDetails[]
    },
  })
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: issueKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          elderly_profile:elderly_profiles(*),
          call:calls(*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data as IssueWithDetails
    },
    enabled: !!id,
  })
}

export function useCreateIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (issue: IssueInsert) => {
      const { data, error } = await supabase
        .from('issues')
        .insert(issue)
        .select()
        .single()

      if (error) throw error
      return data as Issue
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
    },
  })
}

export function useUpdateIssue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: IssueUpdate }) => {
      const { data, error } = await supabase
        .from('issues')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Issue
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(data.id) })
    },
  })
}

export function useElderlyIssues(elderlyId: string) {
  return useQuery({
    queryKey: issueKeys.byElderly(elderlyId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('elderly_profile_id', elderlyId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Issue[]
    },
    enabled: !!elderlyId,
  })
}
