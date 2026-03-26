export type CategorySlug = 'fruit' | 'vegetable' | 'herb' | 'fungus' | 'seafood' | 'game'
export type Availability = 'peak' | 'moderate' | 'light'

export type RegionGroupOut = {
  id: number
  name: string
  slug: string
  description?: string | null
  region_count: number
}

export type RegionOut = {
  id: number
  name: string
  state_code: string
  usda_zones: string
  latitude?: number | null
  longitude?: number | null
  description?: string
  region_group: {
    id: number
    name: string
    slug: string
  }
  state_profile?: StateProfileOut | null
}

export type CategoryCountOut = {
  slug: CategorySlug
  name: string
  count: number
}

export type SeasonalFoodItemOut = {
  id: number
  name: string
  category: CategorySlug
  description: string
  availability: Availability
  notes?: string | null
  storage_tips?: string | null
}

export type StateProfileLinkOut = {
  label: string
  url: string
}

export type StateProfileOut = {
  nickname: string
  capital: string
  top_crops: string[]
  agricultural_highlights: string
  fun_facts: string[]
  resource_links: StateProfileLinkOut[]
}

export type SeasonalCategoryGroupOut = {
  count: number
  items: SeasonalFoodItemOut[]
}

export type SeasonalResponseOut = {
  region: {
    state_code: string
    name: string
    usda_zones: string
  }
  month: number
  month_name: string
  total_count: number
  categories: Record<CategorySlug, SeasonalCategoryGroupOut>
}

export type FoodOut = {
  id: number
  name: string
  category: CategorySlug
  description: string
  image_url?: string | null
  storage_tips?: string | null
}

export type FoodDetailOut = {
  id: number
  name: string
  category: CategorySlug
  description: string
  image_url?: string | null
  storage_tips?: string | null
  availability_by_region: Array<{
    region: { state_code: string; name: string; usda_zones: string }
    months: Array<{
      month: number
      month_name: string
      availability: Availability
      notes?: string | null
    }>
  }>
}

