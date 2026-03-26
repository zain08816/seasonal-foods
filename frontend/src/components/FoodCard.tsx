import type { SeasonalFoodItemOut } from '../types'
import { AVAIL_META, CATEGORY_META } from './categoryMeta'

export default function FoodCard(props: { item: SeasonalFoodItemOut; onClick: () => void }) {
  const { item, onClick } = props

  const category = CATEGORY_META[item.category]
  const avail = AVAIL_META[item.availability]

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <div className="text-[15px] font-semibold text-[#1A1A2E]">{item.name}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-[#6B7280]">
            <span className={`h-2 w-2 rounded-full ${category.dotClass}`} aria-hidden="true" />
            <span>{category.label}</span>
          </div>
        </div>
        <span className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${avail.bgClass} ${avail.className}`}>
          {avail.label}
        </span>
      </div>

      <div className="mt-2 text-sm text-[#6B7280] line-clamp-2">{item.description}</div>
    </button>
  )
}

