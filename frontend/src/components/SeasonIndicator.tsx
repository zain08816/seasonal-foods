import type { Availability } from '../types'

const DOT_CLASS: Record<Availability, string> = {
  peak: 'bg-[#40916C]',
  moderate: 'bg-[#E9A820]',
  light: 'bg-[#9CA3AF]',
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function SeasonIndicator(props: {
  monthAvailability: Partial<Record<number, Availability>>
}) {
  const { monthAvailability } = props

  return (
    <div className="mt-3">
      <div className="text-sm font-semibold text-[#1A1A2E]">Season calendar</div>
      <div className="mt-2 grid grid-cols-6 gap-x-3 gap-y-2">
        {Array.from({ length: 12 }).map((_, idx) => {
          const month = idx + 1
          const availability = monthAvailability[month]
          return (
            <div key={month} className="flex flex-col items-center gap-1">
              <div
                className={`h-3 w-3 rounded-full border border-[#E5E7EB] ${
                  availability ? DOT_CLASS[availability] : 'bg-transparent'
                }`}
                aria-label={`${MONTH_ABBR[idx]}: ${availability ?? 'not available'}`}
              />
              <span className="text-[10px] text-[#6B7280]">{MONTH_ABBR[idx]}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-[#6B7280]">
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#40916C]" /> Peak</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#E9A820]" /> Moderate</span>
        <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-[#9CA3AF]" /> Limited</span>
      </div>
    </div>
  )
}
