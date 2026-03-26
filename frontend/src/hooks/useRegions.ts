import { useQuery } from '@tanstack/react-query'

import { api } from '../api/client'
import type { RegionGroupOut, RegionOut } from '../types'

export function useRegions() {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      const [regionGroups, regions] = await Promise.all([api.regionGroups(), api.regions()])
      return { regionGroups, regions }
    },
  })
}

export type RegionsData = {
  regionGroups: RegionGroupOut[]
  regions: RegionOut[]
}

