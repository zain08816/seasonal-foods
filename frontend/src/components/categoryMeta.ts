import type { CategorySlug } from '../types'

export const CATEGORY_META: Record<
  CategorySlug,
  { label: string; dotClass: string; selectedBgClass: string; icon: string }
> = {
  fruit: { label: 'Fruits', dotClass: 'bg-[#E63946]', selectedBgClass: 'bg-[#E63946]', icon: '🍓' },
  vegetable: { label: 'Vegetables', dotClass: 'bg-[#40916C]', selectedBgClass: 'bg-[#40916C]', icon: '🥬' },
  herb: { label: 'Herbs', dotClass: 'bg-[#2A9D8F]', selectedBgClass: 'bg-[#2A9D8F]', icon: '🌿' },
  fungus: { label: 'Fungi', dotClass: 'bg-[#9C6644]', selectedBgClass: 'bg-[#9C6644]', icon: '🍄' },
  seafood: { label: 'Seafood', dotClass: 'bg-[#457B9D]', selectedBgClass: 'bg-[#457B9D]', icon: '🦪' },
  game: { label: 'Game', dotClass: 'bg-[#6D597A]', selectedBgClass: 'bg-[#6D597A]', icon: '🦌' },
}

export const AVAIL_META: Record<
  'peak' | 'moderate' | 'light',
  { label: string; className: string; bgClass: string }
> = {
  peak: {
    label: 'Peak Season',
    className: 'text-[#2D6A4F]',
    bgClass: 'bg-[#D8F3DC]',
  },
  moderate: {
    label: 'Moderate',
    className: 'text-[#7A4A00]',
    bgClass: 'bg-[#FFF3CD]',
  },
  light: {
    label: 'Limited',
    className: 'text-[#111827]',
    bgClass: 'bg-[#F3F4F6]',
  },
}
