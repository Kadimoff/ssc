import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { apiClient } from '@/data/client'

export const snapshotKey = ['snapshot'] as const

export function useSnapshot() {
  return useQuery({ queryKey: snapshotKey, queryFn: () => apiClient.snapshot() })
}

export function useAction(action: () => Promise<unknown>, success?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: action,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: snapshotKey }); if (success) toast.success(success) },
    onError: (error: Error) => toast.error(error.message),
  })
}
