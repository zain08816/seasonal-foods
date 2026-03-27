import type { RegionOut } from '../types'
import USDAZoneGuide from './USDAZoneGuide'

export default function RegionInfoPanel(props: { region: RegionOut }) {
  const { region } = props

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="text-xl font-semibold text-[var(--text)]">{region.name}</div>
      <div className="mt-2 inline-flex items-center rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-[#2D6A4F]">
        USDA zones {region.usda_zones}
      </div>

      <div className="mt-3">
        <USDAZoneGuide highlightZones={region.usda_zones} />
      </div>

      <p className="mt-3 text-sm text-[var(--text-muted)] leading-relaxed">{region.description ?? ''}</p>
    </div>
  )
}
