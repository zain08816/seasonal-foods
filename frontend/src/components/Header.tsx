import { useMemo } from 'react'
import { Link } from 'react-router-dom'

import DatePicker from './DatePicker'

function LeafLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 4C12.5 4 6 8.5 6 16c0 3.3 1.7 4 4 4 7.5 0 10-6.5 10-14Z"
          stroke="#40916C"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M6 20c2.2-5.2 6.2-8.6 14-12"
          stroke="#40916C"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="hidden sm:inline text-lg font-semibold text-[#1A1A2E]">
        Seasonal Harvest
      </span>
    </div>
  )
}

export default function Header(props: { dateISO: string; onDateChange: (next: string) => void }) {
  const { dateISO, onDateChange } = props

  const todayLabel = useMemo(() => {
    // Keep it simple; DatePicker already handles parsing.
    return dateISO
  }, [dateISO])

  return (
    <header className="w-full py-4">
      <div className="mx-auto max-w-5xl px-4 flex items-center justify-between">
        <Link
          to="/"
          aria-label="Seasonal Harvest home"
          className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#40916C] focus-visible:ring-offset-2 rounded-lg"
        >
          <LeafLogo />
        </Link>
        <div className="flex items-center">
          <div className="sr-only">Active date</div>
          <DatePicker
            valueISO={dateISO}
            onChange={onDateChange}
            ariaLabel={`Active date ${todayLabel}`}
          />
        </div>
      </div>
    </header>
  )
}
