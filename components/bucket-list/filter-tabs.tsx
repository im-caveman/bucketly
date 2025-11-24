"use client"

import { Button } from "@/components/ui/button"

interface FilterTabsProps {
  filter: "all" | "completed" | "incomplete"
  onChange: (filter: "all" | "completed" | "incomplete") => void
}

export function FilterTabs({ filter, onChange }: FilterTabsProps) {
  const tabs = [
    { id: "all", label: "All Items" },
    { id: "incomplete", label: "To Do" },
    { id: "completed", label: "Completed" },
  ] as const

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <Button
          key={tab.id}
          variant={filter === tab.id ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
