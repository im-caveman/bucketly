"use client"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type SortOption = "popular" | "new" | "points" | "a-z"

interface SortMenuProps {
  selected: SortOption
  onChange: (option: SortOption) => void
}

export function SortMenu({ selected, onChange }: SortMenuProps) {
  const sortOptions = [
    { id: "popular", label: "Most Popular" },
    { id: "new", label: "Newest" },
    { id: "points", label: "Most Points" },
    { id: "a-z", label: "A-Z" },
  ] as const

  const selectedLabel = sortOptions.find((opt) => opt.id === selected)?.label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <span>↕️</span>
          Sort: {selectedLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {sortOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.id}
            onClick={() => onChange(opt.id as SortOption)}
            className={selected === opt.id ? "bg-primary/10" : ""}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
