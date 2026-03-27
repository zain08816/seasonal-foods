import { useMemo } from 'react'

import type { CategorySlug, CategoryCountOut } from '../types'
import { CATEGORY_META } from './categoryMeta'

export default function CategoryFilter(props: {
  categories: CategoryCountOut[]
  selected: CategorySlug | 'all'
  onSelect: (next: CategorySlug | 'all') => void
}) {
  const { categories, selected, onSelect } = props

  const available = useMemo(() => categories ?? [], [categories])

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        className={
          selected === 'all'
            ? 'h-10 rounded-full bg-[var(--accent)] px-4 text-sm font-medium text-white'
            : 'h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-alt)]'
        }
        onClick={() => onSelect('all')}
      >
        All
      </button>

      {available.map((c) => {
        const meta = CATEGORY_META[c.slug as CategorySlug]
        return (
          <button
            key={c.slug}
            type="button"
            className={
              selected === c.slug
                ? `h-10 rounded-full px-4 text-sm font-medium text-white ${meta.selectedBgClass}`
                : 'h-10 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--text)] hover:bg-[var(--surface-alt)]'
            }
            onClick={() => onSelect(c.slug)}
          >
            <span className="mr-2" aria-hidden="true">
              {meta.icon}
            </span>
            <span className="whitespace-nowrap">{meta.label}</span>
          </button>
        )
      })}
    </div>
  )
}
