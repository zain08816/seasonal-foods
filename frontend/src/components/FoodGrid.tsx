import type { SeasonalFoodItemOut } from '../types'

import FoodCard from './FoodCard'

export default function FoodGrid(props: {
  items: SeasonalFoodItemOut[]
  onSelectFood: (foodId: number) => void
}) {
  const { items, onSelectFood } = props

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <FoodCard key={it.id} item={it} onClick={() => onSelectFood(it.id)} />
      ))}
    </div>
  )
}

