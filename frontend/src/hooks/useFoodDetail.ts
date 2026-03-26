import { useQuery } from '@tanstack/react-query'

import { api } from '../api/client'
import type { FoodDetailOut } from '../types'

export function useFoodDetail(foodId?: number) {
  return useQuery({
    queryKey: ['food-detail', foodId ?? null],
    enabled: typeof foodId === 'number',
    queryFn: () => api.foodDetail(foodId!),
    staleTime: 1000 * 60 * 60,
  })
}

export type FoodDetailResponse = FoodDetailOut

