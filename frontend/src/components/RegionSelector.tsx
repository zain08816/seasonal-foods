import { useMemo, useState } from 'react'

import { useRegions } from '../hooks/useRegions'
import type { RegionOut } from '../types'

export default function RegionSelector(props: { valueStateCode: string; onChange: (next: string) => void }) {
  const { valueStateCode, onChange } = props

  const { data, isLoading, error } = useRegions()

  const [macroSlug, setMacroSlug] = useState<string | null>(null)

  const stateCodeUpper = valueStateCode.toUpperCase()

  const regions = useMemo(() => data?.regions ?? [], [data?.regions])
  const regionGroups = useMemo(() => data?.regionGroups ?? [], [data?.regionGroups])

  const regionGroupsSorted = useMemo(() => {
    return [...regionGroups].sort((a, b) => a.name.localeCompare(b.name))
  }, [regionGroups])

  const defaultGroupSlug = regionGroupsSorted[0]?.slug ?? 'northeast'

  const stateToRegion = useMemo(() => {
    return regions.reduce<Record<string, RegionOut>>((acc, r) => {
      acc[r.state_code] = r
      return acc
    }, {})
  }, [regions])

  const activeRegion = stateToRegion[stateCodeUpper]

  const inferredGroupSlug = activeRegion?.region_group.slug ?? macroSlug ?? defaultGroupSlug

  const filteredStates = useMemo(() => {
    return regions.filter((r) => r.region_group.slug === inferredGroupSlug)
  }, [regions, inferredGroupSlug])

  if (isLoading) {
    return (
      <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
        Loading regions…
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#6B7280]">
        Failed to load regions.
      </div>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <div className="text-sm font-semibold text-[#1A1A2E]">Region</div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <select
          value={inferredGroupSlug}
          onChange={(e) => {
            setMacroSlug(e.target.value)
            const first = regions.find((r) => r.region_group.slug === e.target.value)
            if (first) onChange(first.state_code)
          }}
          className="h-10 w-full rounded-full border border-[#E5E7EB] bg-white px-3 text-sm"
          aria-label="Select region group"
        >
          {regionGroupsSorted.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          value={stateCodeUpper}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-full rounded-full border border-[#E5E7EB] bg-white px-3 text-sm"
          aria-label="Select state"
        >
          {filteredStates
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((r) => (
              <option key={r.state_code} value={r.state_code}>
                {r.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  )
}

