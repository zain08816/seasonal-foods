export default function MapTooltip(props: {
  x: number
  y: number
  title: string
  subtitle?: string
  zones?: string
}) {
  const { x, y, title, subtitle, zones } = props

  return (
    <div
      className="pointer-events-none absolute z-10 rounded-xl bg-white px-3 py-2 shadow-lg border border-[#E5E7EB] min-w-[180px]"
      style={{ left: x, top: y, transform: 'translate(-50%, -120%)' }}
    >
      <div className="text-sm font-semibold text-[#1A1A2E]">{title}</div>
      {subtitle ? <div className="text-xs text-[#6B7280]">{subtitle}</div> : null}
      {zones ? <div className="text-xs font-medium text-[#2D6A4F] mt-1">USDA {zones}</div> : null}
    </div>
  )
}

