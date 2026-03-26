import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import CategoryFilter from '../components/CategoryFilter'
import FoodDetailModal from '../components/FoodDetailModal'
import FoodGrid from '../components/FoodGrid'
import Header from '../components/Header'
import RegionInfoPanel from '../components/RegionInfoPanel'
import RegionSelector from '../components/RegionSelector'
import StateProfileCard from '../components/StateProfileCard'
import type { CategorySlug, SeasonalFoodItemOut } from '../types'
import { useCategories } from '../hooks/useCategories'
import { useRegionDetail } from '../hooks/useRegionDetail'
import { useSeasonalFoods } from '../hooks/useSeasonalFoods'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const CATEGORY_ORDER: CategorySlug[] = ['fruit', 'vegetable', 'herb', 'fungus', 'seafood', 'game']

export default function StatePage() {
  const { stateCode } = useParams<{ stateCode: string }>()
  const navigate = useNavigate()
  const code = (stateCode ?? '').toUpperCase()

  const { data: categories } = useCategories()
  const { data: region, isLoading: regionLoading } = useRegionDetail(code)
  const [dateISO, setDateISO] = useState(todayISO)
  const seasonal = useSeasonalFoods({ region: code, date: dateISO })

  const [selectedCategory, setSelectedCategory] = useState<CategorySlug | 'all'>('all')
  const [activeFoodId, setActiveFoodId] = useState<number | undefined>(undefined)

  const items: SeasonalFoodItemOut[] = useMemo(() => {
    const cats = seasonal.data?.categories
    if (!cats) return []
    if (selectedCategory === 'all') {
      const flat: SeasonalFoodItemOut[] = []
      for (const c of CATEGORY_ORDER) {
        flat.push(...cats[c].items)
      }
      return flat
    }
    return cats[selectedCategory].items
  }, [seasonal.data, selectedCategory])

  const totalCount = seasonal.data?.total_count ?? 0

  return (
    <div className="w-full">
      <Header dateISO={dateISO} onDateChange={setDateISO} />

      <main className="mx-auto max-w-5xl px-4 pb-12">
        <div className="mt-2 text-sm text-[#6B7280]">
          <Link to="/" className="text-[#40916C] hover:underline">
            {region?.region_group?.name ?? 'Northeast'}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#1A1A2E] font-semibold">{region?.name ?? code}</span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 items-start">
          <div className="hidden md:block sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="space-y-4">
              <RegionSelector
                valueStateCode={code}
                onChange={(next) => navigate(`/state/${next.toLowerCase()}`)}
              />
              {regionLoading ? (
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">Loading area…</div>
              ) : region ? (
                <>
                  <RegionInfoPanel region={region} />
                  <StateProfileCard region={region} />
                </>
              ) : null}
            </div>
          </div>

          <div className="md:hidden space-y-4">
            <RegionSelector
              valueStateCode={code}
              onChange={(next) => navigate(`/state/${next.toLowerCase()}`)}
            />
            {region && (
              <>
                <RegionInfoPanel region={region} />
                <StateProfileCard region={region} />
              </>
            )}
          </div>

          <section>
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-[#6B7280]">Results</div>
                  <div className="text-xl font-semibold text-[#1A1A2E]">{totalCount} items in season</div>
                </div>
              </div>

              <div className="mt-4">
                {categories ? (
                  <CategoryFilter
                    categories={categories}
                    selected={selectedCategory}
                    onSelect={(next) => setSelectedCategory(next)}
                  />
                ) : (
                  <div className="text-sm text-[#6B7280]">Loading categories…</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              {seasonal.isLoading ? (
                <div className="text-sm text-[#6B7280]">Loading seasonal foods…</div>
              ) : items.length === 0 ? (
                <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 text-sm text-[#6B7280]">
                  No in-season items found for this date.
                </div>
              ) : (
                <FoodGrid
                  items={items}
                  onSelectFood={(foodId) => setActiveFoodId(foodId)}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      <FoodDetailModal
        open={typeof activeFoodId === 'number'}
        foodId={activeFoodId}
        regionStateCode={code}
        onClose={() => setActiveFoodId(undefined)}
      />
    </div>
  )
}
