import type {
  CategoryCountOut,
  FoodDetailOut,
  RegionGroupOut,
  RegionOut,
  SeasonalResponseOut,
} from '../types'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.toString() ?? 'http://127.0.0.1:8000'

async function getJson<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(API_BASE_URL + path, window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null) continue
      url.searchParams.set(k, String(v))
    }
  }

  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${path} failed (${res.status}): ${text}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  async regionGroups(): Promise<RegionGroupOut[]> {
    return getJson('/api/region-groups')
  },
  async regions(group?: string): Promise<RegionOut[]> {
    return getJson('/api/regions', group ? { group } : undefined)
  },
  async regionDetail(stateCode: string): Promise<RegionOut> {
    return getJson(`/api/regions/${stateCode}`)
  },
  async categories(): Promise<CategoryCountOut[]> {
    return getJson('/api/categories')
  },
  async seasonal(params: { region: string; date?: string; month?: number; category?: string }): Promise<SeasonalResponseOut> {
    return getJson('/api/seasonal', params)
  },
  async foodDetail(foodId: number): Promise<FoodDetailOut> {
    return getJson(`/api/foods/${foodId}`)
  },
  async foods(category?: string): Promise<Array<{ id: number }>> {
    return getJson('/api/foods', category ? { category } : undefined)
  },
}

