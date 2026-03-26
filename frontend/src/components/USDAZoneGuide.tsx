import { useState, type ReactNode } from 'react'

const COLD: [number, number, number] = [37, 99, 235]
const WARM: [number, number, number] = [249, 115, 22]

function parseZoneRange(zones: string | undefined): { start: number; end: number } | null {
  if (!zones) return null
  const nums = [...zones.matchAll(/\d+/g)].map((m) => Number(m[0])).filter((n) => n >= 1 && n <= 13)
  if (nums.length === 0) return null
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)
  return { start: Math.max(1, lo), end: Math.min(13, hi) }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function zoneColor(zone: number): string {
  const t = (zone - 1) / 12
  const r = Math.round(lerp(COLD[0], WARM[0], t))
  const g = Math.round(lerp(COLD[1], WARM[1], t))
  const b = Math.round(lerp(COLD[2], WARM[2], t))
  return `rgb(${r},${g},${b})`
}

function TemperatureScale(props: { range: { start: number; end: number } | null; zones?: string; open: boolean }) {
  const { range, zones, open } = props

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 transition-shadow hover:shadow-md cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold text-[#1A1A2E]">
          USDA Hardiness Zones{zones ? ` (${zones})` : ''}
        </div>
        <svg
          className={`h-3.5 w-3.5 text-[#9CA3AF] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <div className="text-[10px] text-[#9CA3AF] w-8 shrink-0">Cold</div>
        <div className="flex-1 flex h-2 rounded-full overflow-hidden">
          {Array.from({ length: 13 }, (_, i) => {
            const zone = i + 1
            const highlighted = range ? zone >= range.start && zone <= range.end : false
            return (
              <div
                key={zone}
                className="flex-1"
                style={{
                  backgroundColor: zoneColor(zone),
                  opacity: range ? (highlighted ? 1 : 0.25) : 0.8,
                  boxShadow: highlighted ? 'inset 0 0 0 1px rgba(45,106,79,.6)' : 'none',
                }}
              />
            )
          })}
        </div>
        <div className="text-[10px] text-[#9CA3AF] w-8 shrink-0 text-right">Warm</div>
      </div>

      <div className="mt-1 flex justify-between text-[9px] text-[#9CA3AF]">
        <span>Zone 1 (-60 F)</span>
        <span>Zone 13 (70 F)</span>
      </div>
    </div>
  )
}

function TextBlock(props: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-[#1A1A2E]">{props.title}</div>
      <div className="mt-0.5 text-xs text-[#6B7280] leading-relaxed">{props.children}</div>
    </div>
  )
}

export default function USDAZoneGuide(props: { highlightZones?: string }) {
  const { highlightZones } = props
  const range = parseZoneRange(highlightZones)
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        className="w-full text-left"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <TemperatureScale range={range} zones={highlightZones} open={open} />
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-[#E5E7EB] bg-white p-3 space-y-2.5">
          <TextBlock title="What are these zones?">
            USDA Plant Hardiness Zones divide the US into 13 zones based on the average annual minimum winter
            temperature. They indicate what can survive winter in a given area.
          </TextBlock>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <TextBlock title="Numbers (1-13)">
              Lower numbers are colder, higher numbers are warmer. Each zone covers a 10 F range of minimum winter
              temperature.
            </TextBlock>
            <TextBlock title="Letters (a / b)">
              Each zone splits into a colder half (<span className="font-semibold">a</span>) and a warmer half (
              <span className="font-semibold">b</span>), each spanning 5 F. For example, 6a is -10 F to -5 F and 6b
              is -5 F to 0 F.
            </TextBlock>
          </div>
        </div>
      )}
    </div>
  )
}
