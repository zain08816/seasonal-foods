import { useQuery } from '@tanstack/react-query'

import { api } from '../api/client'
import type { RegionOut } from '../types'

export function useRegionDetail(stateCode?: string) {
  return useQuery({
    queryKey: ['region-detail', stateCode ?? null],
    enabled: typeof stateCode === 'string' && stateCode.length > 0,
    queryFn: () => api.regionDetail(stateCode!),
    staleTime: 1000 * 60 * 60,
  })
}

export type RegionDetailResponse = RegionOut

