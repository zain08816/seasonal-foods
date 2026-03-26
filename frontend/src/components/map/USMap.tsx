import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

import MapTooltip from './MapTooltip'

type RegionByState = Record<
  string,
  {
    name: string
    usda_zones: string
    region_group_name: string
    region_group_slug: string
  }
>

/** Base / hover / selected fills per macro-region slug (stable API keys from backend). */
const REGION_PALETTE: Record<string, { fill: string; hover: string; active: string }> = {
  northeast: { fill: '#40916C', hover: '#52B788', active: '#2D6A4F' },
  southeast: { fill: '#E07A5F', hover: '#ED9A8A', active: '#C65D48' },
  'south-central': { fill: '#BC6C25', hover: '#D4893D', active: '#955620' },
  midwest: { fill: '#D4A574', hover: '#E3BC94', active: '#B8895E' },
  'great-plains': { fill: '#7B9EB5', hover: '#9CB7C9', active: '#5E7F96' },
  'pacific-northwest': { fill: '#457B9D', hover: '#6A9BC4', active: '#356189' },
  'california-hawaii': { fill: '#6A4C93', hover: '#8B6FB5', active: '#523A75' },
  'mountain-west': { fill: '#6B9080', hover: '#89B0A0', active: '#527A6C' },
}

const MAP_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const FIPS_TO_STATE: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY',
}

export default function USMap(props: {
  regionByState: RegionByState
  onSelect: (stateCode: string) => void
  onHoverState?: (stateCode: string | null) => void
  activeStateCode?: string | null
}) {
  const { regionByState, onSelect, onHoverState, activeStateCode } = props

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; stateCode: string; title: string; zones: string; group: string } | null>(null)

  const supported = useMemo(() => new Set(Object.keys(regionByState)), [regionByState])

  const legendEntries = useMemo(() => {
    const seen = new Map<string, string>()
    for (const r of Object.values(regionByState)) {
      const slug = r.region_group_slug
      if (!slug || seen.has(slug)) continue
      seen.set(slug, r.region_group_name || slug)
    }
    return [...seen.entries()]
      .map(([slug, name]) => ({
        slug,
        name,
        colors: REGION_PALETTE[slug] ?? REGION_PALETTE.northeast,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [regionByState])

  function paletteFor(stateCode: string) {
    const slug = regionByState[stateCode]?.region_group_slug
    return (slug && REGION_PALETTE[slug]) ? REGION_PALETTE[slug] : REGION_PALETTE.northeast
  }

  function handleEnter(evt: MouseEvent<SVGPathElement>, stateCode: string, title: string) {
    const rect = containerRef.current?.getBoundingClientRect()
    const x = evt.clientX - (rect?.left ?? 0)
    const y = evt.clientY - (rect?.top ?? 0)
    setTooltip({
      x,
      y,
      stateCode,
      title,
      zones: regionByState[stateCode]?.usda_zones ?? '',
      group: regionByState[stateCode]?.region_group_name ?? '',
    })
    onHoverState?.(stateCode)
  }

  function handleLeave() {
    setTooltip(null)
    onHoverState?.(null)
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <ComposableMap projection="geoAlbersUsa" width={950} height={520} className="mx-auto">
        <Geographies geography={MAP_URL}>
          {({ geographies }: { geographies: unknown[] }) =>
            (geographies as Array<{ rsmKey: string; id: string; properties: Record<string, unknown> }>).map((geo) => {
              const stateCode = FIPS_TO_STATE[geo.id] ?? ''
              const supportedState = supported.has(stateCode)
              const title = String(geo.properties.name ?? stateCode)

              const pal = supportedState ? paletteFor(stateCode) : null
              const defaultFill = pal ? (activeStateCode === stateCode ? pal.active : pal.fill) : '#E5E7EB'
              const hoverFill = pal?.hover ?? '#E5E7EB'
              const isActive = activeStateCode === stateCode

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  tabIndex={supportedState ? 0 : -1}
                  style={{
                    default: {
                      fill: defaultFill,
                      stroke: isActive ? '#1A1A2E' : '#FFFFFF',
                      strokeWidth: isActive ? 1.5 : 1,
                      outline: 'none',
                    },
                    hover: {
                      fill: hoverFill,
                      stroke: isActive ? '#1A1A2E' : '#FFFFFF',
                      strokeWidth: isActive ? 1.5 : 1,
                      outline: 'none',
                    },
                    pressed: {
                      fill: hoverFill,
                      stroke: isActive ? '#1A1A2E' : '#FFFFFF',
                      strokeWidth: isActive ? 1.5 : 1,
                      outline: 'none',
                    },
                  }}
                  aria-label={`${title} (${stateCode})`}
                  onMouseEnter={(evt: MouseEvent<SVGPathElement>) => {
                    if (!supportedState) return
                    handleEnter(evt, stateCode, title)
                  }}
                  onMouseLeave={() => handleLeave()}
                  onFocus={() => {
                    if (!supportedState) return
                    // Keyboard: show tooltip at the center-ish of the state using mouse event is unavailable.
                    const region = regionByState[stateCode]
                    setTooltip({
                      x: 120,
                      y: 80,
                      stateCode,
                      title,
                      zones: region?.usda_zones ?? '',
                      group: region?.region_group_name ?? '',
                    })
                    onHoverState?.(stateCode)
                  }}
                  onBlur={() => handleLeave()}
                  onClick={() => {
                    if (!supportedState) return
                    onSelect(stateCode)
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      {legendEntries.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-[#E5E7EB] pt-3 text-xs text-[#6B7280]">
          <span className="font-medium text-[#1A1A2E]">Regions:</span>
          {legendEntries.map(({ slug, name, colors }) => (
            <span key={slug} className="inline-flex items-center gap-1.5">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-sm border border-black/10"
                style={{ backgroundColor: colors.fill }}
                aria-hidden
              />
              {name}
            </span>
          ))}
        </div>
      ) : null}

      {tooltip ? (
        <MapTooltip
          x={tooltip.x}
          y={tooltip.y}
          title={`${tooltip.title}`}
          subtitle={tooltip.group}
          zones={tooltip.zones}
        />
      ) : null}
    </div>
  )
}

