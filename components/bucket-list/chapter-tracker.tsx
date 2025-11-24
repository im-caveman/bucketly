"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface Chapter {
  id: string
  number: number
  title: string
  pages: number
  completed: boolean
  notes?: string
}

interface ChapterTrackerProps {
  bookTitle: string
  author: string
  chapters: Chapter[]
  onChapterToggle: (id: string) => void
  onChapterNotes: (id: string, notes: string) => void
  onMarkComplete: () => void
}

export function ChapterTracker({
  bookTitle,
  author,
  chapters,
  onChapterToggle,
  onChapterNotes,
  onMarkComplete,
}: ChapterTrackerProps) {
  const completed = chapters.filter((c) => c.completed).length
  const total = chapters.length
  const percentage = Math.round((completed / total) * 100)
  const totalPages = chapters.reduce((sum, c) => sum + c.pages, 0)
  const completedPages = chapters.filter((c) => c.completed).reduce((sum, c) => sum + c.pages, 0)

  return (
    <div className="space-y-6">
      {/* Book Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-6">
            <div className="w-32 h-48 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-6xl">
              📚
            </div>
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold mb-1">{bookTitle}</h2>
              <p className="text-muted-foreground mb-4">by {author}</p>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Progress</p>
                  <p className="font-display text-2xl font-bold text-primary">{percentage}%</p>
                  <p className="text-xs text-muted-foreground">
                    {completed}/{total} chapters
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Pages Read</p>
                  <p className="font-display text-2xl font-bold text-accent">{completedPages}</p>
                  <p className="text-xs text-muted-foreground">of {totalPages}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-semibold">Reading Speed</p>
                  <p className="font-display text-2xl font-bold text-secondary">
                    {chapters.length > 0 ? Math.ceil(totalPages / chapters.length) : 0}pp
                  </p>
                  <p className="text-xs text-muted-foreground">per chapter</p>
                </div>
              </div>

              <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <Button onClick={onMarkComplete} disabled={completed !== total} className="w-full gap-2">
                🎉 Mark Book Complete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chapters List */}
      <div>
        <h3 className="font-display font-bold text-lg mb-4">Chapters</h3>
        <div className="space-y-2">
          {chapters.map((chapter) => (
            <Collapsible key={chapter.id}>
              <Card className={chapter.completed ? "opacity-60 bg-muted/50" : ""}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={chapter.completed}
                        onCheckedChange={() => onChapterToggle(chapter.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-semibold ${chapter.completed ? "line-through text-muted-foreground" : ""}`}
                        >
                          Chapter {chapter.number}: {chapter.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">{chapter.pages} pages</p>
                      </div>
                      {chapter.completed && <span className="text-green-600">✓</span>}
                    </div>
                  </CardContent>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="p-4 border-t border-border">
                    <label className="text-sm font-semibold block mb-2">Notes for this chapter</label>
                    <Textarea
                      value={chapter.notes || ""}
                      onChange={(e) => onChapterNotes(chapter.id, e.target.value)}
                      placeholder="What did you think about this chapter?"
                      className="min-h-24"
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  )
}
