import { useEffect, useMemo, useCallback } from 'react'

import type { Availability } from '../types'
import SeasonIndicator from './SeasonIndicator'
import { useFoodDetail } from '../hooks/useFoodDetail'

export default function FoodDetailModal(props: {
  foodId?: number
  regionStateCode: string
  onClose: () => void
  open: boolean
}) {
  const { foodId, regionStateCode, onClose, open } = props

  const { data, isLoading } = useFoodDetail(foodId)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) return
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  const monthAvailability = useMemo(() => {
    if (!data) return {}
    const regionEntry = data.availability_by_region.find((r) => r.region.state_code === regionStateCode)
    const monthMap: Partial<Record<number, Availability>> = {}
    if (!regionEntry) return monthMap
    for (const m of regionEntry.months) {
      monthMap[m.month] = m.availability
    }
    return monthMap
  }, [data, regionStateCode])

  if (!open) return null

  const content = (
    <>
      {isLoading ? (
        <div className="text-sm text-[var(--text-muted)]">Loading...</div>
      ) : (
        <>
          <div className="text-sm text-[var(--text-muted)]">{data?.description}</div>
          <SeasonIndicator monthAvailability={monthAvailability} />
          {data?.storage_tips ? (
            <div className="mt-4">
              <div className="text-sm font-semibold text-[var(--text)]">Storage tips</div>
              <div className="mt-1 text-sm text-[var(--text-muted)]">{data.storage_tips}</div>
            </div>
          ) : null}
        </>
      )}
    </>
  )

  const header = (
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-[var(--border)]">
      <div>
        <div className="text-lg font-semibold text-[var(--text)]">{data?.name ?? (foodId ? `Food #${foodId}` : 'Food')}</div>
        {data ? (
          <div className="mt-1 text-sm text-[var(--text-muted)]">
            Category: <span className="font-medium capitalize">{data.category}</span>
          </div>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  )

  return (
    <>
      {/* Desktop/tablet modal */}
      <div
        className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/30 p-6"
        role="dialog"
        aria-modal="true"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="w-full max-w-xl rounded-2xl bg-[var(--surface)] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {header}
          <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
            {content}
          </div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="md:hidden fixed inset-0 z-50">
        <button type="button" onClick={onClose} className="absolute inset-0 bg-black/30" aria-label="Close overlay" />
        <div className="absolute left-0 right-0 bottom-0 rounded-t-2xl bg-[var(--surface)] shadow-xl max-h-[78vh] overflow-y-auto">
          {header}
          <div className="px-5 py-4 pb-8">
            {content}
          </div>
        </div>
      </div>
    </>
  )
}
