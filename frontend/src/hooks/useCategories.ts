import { useQuery } from '@tanstack/react-query'

import { api } from '../api/client'
import type { CategoryCountOut } from '../types'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.categories(),
    staleTime: 1000 * 60 * 60,
  })
}

export type CategoriesData = CategoryCountOut[]

