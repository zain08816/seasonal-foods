import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'

import MapTooltip from './MapTooltip'

type RegionByState = Record<
  string,
  {
    name: string
    usda_zones: string
    region_group_name: string
  }
>

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

              const defaultFill = supportedState ? '#40916C' : '#E5E7EB'
              const hoverFill = supportedState ? '#52B788' : '#E5E7EB'
              const isActive = activeStateCode === stateCode

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  tabIndex={0}
                  style={{
                    default: { fill: isActive ? '#52B788' : defaultFill, stroke: '#FFFFFF', strokeWidth: 1 },
                    hover: { fill: hoverFill, stroke: '#FFFFFF', strokeWidth: 1 },
                    pressed: { fill: hoverFill, stroke: '#FFFFFF', strokeWidth: 1 },
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

