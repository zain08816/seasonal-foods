import { useMemo } from 'react'

function shiftMonth(dateISO: string, delta: number) {
  const d = new Date(dateISO)
  const next = new Date(d)
  next.setMonth(next.getMonth() + delta)
  // Keep day-of-month stable; JS auto-rolls if needed.
  const yyyy = next.getFullYear()
  const mm = String(next.getMonth() + 1).padStart(2, '0')
  const dd = String(next.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function DatePicker(props: {
  valueISO: string
  onChange: (nextISO: string) => void
  ariaLabel?: string
}) {
  const { valueISO, onChange, ariaLabel } = props

  const label = useMemo(() => valueISO, [valueISO])

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Previous month"
        className="h-10 w-10 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6]"
        onClick={() => onChange(shiftMonth(valueISO, -1))}
      >
        ‹
      </button>

      <input
        type="date"
        aria-label={ariaLabel ?? label}
        value={valueISO}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-full border border-[#E5E7EB] bg-white px-4 text-sm text-[#1A1A2E] shadow-sm"
      />

      <button
        type="button"
        aria-label="Next month"
        className="h-10 w-10 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6]"
        onClick={() => onChange(shiftMonth(valueISO, 1))}
      >
        ›
      </button>
    </div>
  )
}

