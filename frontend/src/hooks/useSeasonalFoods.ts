import { useQuery } from '@tanstack/react-query'

import { api } from '../api/client'
import type { CategorySlug, SeasonalResponseOut } from '../types'

export function useSeasonalFoods(params: {
  region: string
  date?: string
  month?: number
  category?: CategorySlug
  enabled?: boolean
}) {
  const { region, date, month, category, enabled: enabledFlag = true } = params

  return useQuery({
    queryKey: ['seasonal', region, date ?? null, month ?? null, category ?? null],
    enabled: enabledFlag && Boolean(region) && (Boolean(date) || Boolean(month)),
    queryFn: () =>
      api.seasonal({
        region,
        date,
        month,
        category,
      }),
    staleTime: 1000 * 60,
  })
}

export type SeasonalFoodsResponse = SeasonalResponseOut

