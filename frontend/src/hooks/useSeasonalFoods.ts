import { useQuery } from '@tanstack/react-query'

import { api } from '../api/client'
import type { CategorySlug, SeasonalResponseOut } from '../types'

export function useSeasonalFoods(params: {
  region: string
  date?: string
  month?: number
  category?: CategorySlug
}) {
  const { region, date, month, category } = params

  return useQuery({
    queryKey: ['seasonal', region, date ?? null, month ?? null, category ?? null],
    enabled: Boolean(region) && (Boolean(date) || Boolean(month)),
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

