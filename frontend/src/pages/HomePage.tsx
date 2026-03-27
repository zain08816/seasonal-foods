import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { AVAIL_META, CATEGORY_META } from '../components/categoryMeta'
import FoodDetailModal from '../components/FoodDetailModal'
import Header from '../components/Header'
import USMap from '../components/map/USMap'
import USDAZoneGuide from '../components/USDAZoneGuide'
import { useRegions } from '../hooks/useRegions'
import { useSeasonalFoods } from '../hooks/useSeasonalFoods'
import type { Availability, CategorySlug } from '../types'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function HomePage() {
  const { data: regionsData, isLoading: regionsLoading } = useRegions()

  const [dateISO, setDateISO] = useState(todayISO)
  const [selectedStateCode, setSelectedStateCode] = useState('NJ')
  const [hoveredStateCode, setHoveredStateCode] = useState<string | null>(null)
  const [activeFoodId, setActiveFoodId] = useState<number | undefined>(undefined)

  const regionByState = useMemo(() => {
    const by: Record<
      string,
      {
        name: string
        usda_zones: string
        region_group_name: string
        region_group_slug: string
      }
    > = {}
    for (const r of regionsData?.regions ?? []) {
      by[r.state_code] = {
        name: r.name,
        usda_zones: r.usda_zones,
        region_group_name: r.region_group?.name ?? '',
        region_group_slug: r.region_group?.slug ?? '',
      }
    }
    return by
  }, [regionsData?.regions])

  const effectiveSelected = regionByState[selectedStateCode]
    ? selectedStateCode
    : Object.keys(regionByState)[0] ?? 'NJ'

  const teaserState = hoveredStateCode ?? effectiveSelected

  const teaserQuery = useSeasonalFoods({ region: teaserState, date: dateISO })

  const groupedByAvailability = useMemo(() => {
    const categories = teaserQuery.data?.categories
    const groups: Record<Availability, Array<{ id: number; name: string; category: CategorySlug }>> = {
      peak: [], moderate: [], light: [],
    }
    if (!categories) return groups
    for (const cat of Object.values(categories)) {
      for (const item of cat.items) {
        groups[item.availability].push(item)
      }
    }
    for (const arr of Object.values(groups)) {
      arr.sort((a, b) => a.name.localeCompare(b.name))
    }
    return groups
  }, [teaserQuery.data])

  const totalCount = teaserQuery.data?.total_count ?? 0
  const stateOptions = useMemo(() => {
    return Object.entries(regionByState)
      .map(([code, region]) => ({ code, name: region.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [regionByState])

  return (
    <div className="w-full">
      <Header dateISO={dateISO} onDateChange={setDateISO} />

      <main className="mx-auto max-w-5xl px-4">
        <div className="mt-2">
          <h2 className="text-2xl font-semibold text-[var(--text)]">Explore what&apos;s in season</h2>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Click a state to see seasonal fruits, vegetables, seafood, and more.
          </p>
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <label htmlFor="state-quick-select" className="text-xs font-medium text-[var(--text-muted)]">
              State quick select
            </label>
            <select
              id="state-quick-select"
              value={effectiveSelected}
              onChange={(e) => setSelectedStateCode(e.target.value)}
              className="h-8 max-w-[220px] rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text)]"
              aria-label="Select a state"
            >
              {stateOptions.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {regionsLoading ? (
            <div className="text-sm text-[var(--text-muted)]">Loading map…</div>
          ) : (
            <USMap
              regionByState={regionByState}
              activeStateCode={effectiveSelected}
              onHoverState={(code) => setHoveredStateCode(code)}
              onSelect={(code) => setSelectedStateCode(code)}
            />
          )}
        </div>

        <div className="mt-4">
          <USDAZoneGuide highlightZones={regionByState[teaserState]?.usda_zones} />
        </div>

        <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[var(--text)]">In season now</div>
              <div className="mt-1 text-xs text-[var(--text-muted)]">
                <span className="font-medium">{totalCount}</span> items for{' '}
                <span className="font-medium">{regionByState[teaserState]?.name ?? teaserState}</span>{' '}
                in {teaserQuery.data?.month_name ?? dateISO}
              </div>
            </div>
            <Link
              to={`/state/${teaserState.toLowerCase()}`}
              className="shrink-0 rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[var(--accent-hover)]"
            >
              View {regionByState[teaserState]?.name ?? teaserState} →
            </Link>
          </div>

          <div className="mt-3 space-y-3">
            {(['peak', 'moderate', 'light'] as const).map((tier) => {
              const items = groupedByAvailability[tier]
              if (items.length === 0) return null
              const meta = AVAIL_META[tier]
              return (
                <div key={tier}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: tier === 'peak' ? 'var(--peak-dot)' : tier === 'moderate' ? 'var(--moderate-dot)' : 'var(--limited-dot)' }}
                    />
                    <span className={`text-xs font-semibold ${meta.className}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">({items.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((it) => {
                      const catMeta = CATEGORY_META[it.category]
                      return (
                        <button
                          key={it.id}
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-shadow hover:shadow-sm ${meta.bgClass} ${meta.className}`}
                          onClick={() => setActiveFoodId(it.id)}
                        >
                          <span className="text-sm leading-none">{catMeta.icon}</span>
                          {it.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      <FoodDetailModal
        open={typeof activeFoodId === 'number'}
        foodId={activeFoodId}
        regionStateCode={effectiveSelected}
        onClose={() => setActiveFoodId(undefined)}
      />
    </div>
  )
}
