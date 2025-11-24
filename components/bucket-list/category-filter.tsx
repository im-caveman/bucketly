"use client"

import type { Category } from "@/types/bucket-list"
import { Button } from "@/components/ui/button"

interface CategoryFilterProps {
  selected: Category | "all"
  onChange: (category: Category | "all") => void
}

const categories = [
  { id: "all", label: "All", icon: "⭐" },
  { id: "adventures", label: "Adventures", icon: "🎯" },
  { id: "places", label: "Places", icon: "🌍" },
  { id: "cuisines", label: "Cuisines", icon: "🍽️" },
  { id: "books", label: "Books", icon: "📚" },
  { id: "songs", label: "Songs", icon: "🎵" },
  { id: "monuments", label: "Monuments", icon: "🏛️" },
  { id: "acts-of-service", label: "Acts of Service", icon: "🤝" },
  { id: "miscellaneous", label: "Miscellaneous", icon: "✨" },
] as const

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={selected === cat.id ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(cat.id as Category | "all")}
          className="gap-2"
        >
          <span>{cat.icon}</span>
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
