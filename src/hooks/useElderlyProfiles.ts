import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ElderlyProfile, ElderlyProfileInsert, ElderlyProfileUpdate } from '@/types'

export const elderlyKeys = {
  all: ['elderly'] as const,
  lists: () => [...elderlyKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...elderlyKeys.lists(), filters] as const,
  details: () => [...elderlyKeys.all, 'detail'] as const,
  detail: (id: string) => [...elderlyKeys.details(), id] as const,
}

export function useElderlyProfiles(options?: { activeOnly?: boolean }) {
  return useQuery({
    queryKey: elderlyKeys.list({ activeOnly: options?.activeOnly }),
    queryFn: async () => {
      let query = supabase
        .from('elderly_profiles')
        .select('*')
        .order('last_name', { ascending: true })

      if (options?.activeOnly) {
        query = query.eq('is_active', true)
      }

      const { data, error } = await query

      if (error) throw error
      return data as ElderlyProfile[]
    },
  })
}

export function useElderlyProfile(id: string) {
  return useQuery({
    queryKey: elderlyKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elderly_profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as ElderlyProfile
    },
    enabled: !!id,
  })
}

export function useCreateElderlyProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (profile: ElderlyProfileInsert) => {
      const { data, error } = await supabase
        .from('elderly_profiles')
        .insert(profile)
        .select()
        .single()

      if (error) throw error
      return data as ElderlyProfile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: elderlyKeys.lists() })
    },
  })
}

export function useUpdateElderlyProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ElderlyProfileUpdate }) => {
      const { data, error } = await supabase
        .from('elderly_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ElderlyProfile
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: elderlyKeys.lists() })
      queryClient.invalidateQueries({ queryKey: elderlyKeys.detail(data.id) })
    },
  })
}

export function useDeleteElderlyProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('elderly_profiles')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: elderlyKeys.lists() })
    },
  })
}
