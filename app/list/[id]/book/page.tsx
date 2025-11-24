"use client"

import { useState } from "react"
import { ChapterTracker } from "@/components/bucket-list/chapter-tracker"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Chapter {
  id: string
  number: number
  title: string
  pages: number
  completed: boolean
  notes?: string
}

// Mock book data
const mockBook = {
  id: "1",
  title: "1984",
  author: "George Orwell",
  chapters: [
    {
      id: "ch1",
      number: 1,
      title: "It was a bright cold day in April",
      pages: 45,
      completed: true,
      notes: "Intense opening. Really sets the dystopian tone.",
    },
    {
      id: "ch2",
      number: 2,
      title: "Winston Smith",
      pages: 52,
      completed: true,
      notes: "Interesting character development",
    },
    { id: "ch3", number: 3, title: "Ministry of Truth", pages: 48, completed: false },
    { id: "ch4", number: 4, title: "Thoughtcrime", pages: 55, completed: false },
    { id: "ch5", number: 5, title: "The Brotherhood", pages: 60, completed: false },
  ] as Chapter[],
}

export default function BookTrackerPage() {
  const [chapters, setChapters] = useState(mockBook.chapters)

  const handleChapterToggle = (id: string) => {
    setChapters(chapters.map((ch) => (ch.id === id ? { ...ch, completed: !ch.completed } : ch)))
  }

  const handleChapterNotes = (id: string, notes: string) => {
    setChapters(chapters.map((ch) => (ch.id === id ? { ...ch, notes } : ch)))
  }

  const handleMarkComplete = () => {
    console.log("[v0] Book completed:", mockBook.title)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-8">
            ← Back
          </Button>
        </Link>

        <ChapterTracker
          bookTitle={mockBook.title}
          author={mockBook.author}
          chapters={chapters}
          onChapterToggle={handleChapterToggle}
          onChapterNotes={handleChapterNotes}
          onMarkComplete={handleMarkComplete}
        />
      </div>
    </div>
  )
}
