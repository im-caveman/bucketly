"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { WizardStep } from "@/components/bucket-list/wizard-step"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import type { Category } from "@/types/bucket-list"
import { validateListName, validateCategory, validateItemTitle, validatePoints } from "@/lib/validation"
import { handleSupabaseError, formatErrorMessage } from "@/lib/error-handler"
import { useAdmin } from "@/hooks/use-admin"
import { fetchGlobalItems } from "@/lib/bucket-list-service"
import type { GlobalItem } from "@/types/supabase"
import { useEffect } from "react"

interface ListItem {
  id: string
  title: string
  description: string | null
  difficulty?: "easy" | "medium" | "hard" | null
  location?: string | null
  points: number
  target_value?: number
  unit_type?: string | null
}

interface CustomListItem {
  id: string
  title: string
  description: string
  difficulty: "easy" | "medium" | "hard"
  location?: string
  target_value?: number
  unit_type?: string
}

const categoriesList = [
  { id: "adventures", label: "Adventures", icon: "🎯" },
  { id: "places", label: "Places", icon: "🌍" },
  { id: "cuisines", label: "Cuisines", icon: "🍽️" },
  { id: "books", label: "Books", icon: "📚" },
  { id: "songs", label: "Songs", icon: "🎵" },
  { id: "monuments", label: "Monuments", icon: "🏛️" },
  { id: "acts-of-service", label: "Acts of Service", icon: "🤝" },
  { id: "miscellaneous", label: "Miscellaneous", icon: "✨" },
] as const



export default function CreateListPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { isAdmin } = useAdmin()
  const [step, setStep] = useState(1)
  const [listName, setListName] = useState("")
  const [listCategory, setListCategory] = useState<Category>("miscellaneous")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false) // Default to private
  const [selectedItems, setSelectedItems] = useState<ListItem[]>([])
  const [customItems, setCustomItems] = useState<CustomListItem[]>([])
  const [addMode, setAddMode] = useState<"search" | "custom">("search")
  const [customItemTitle, setCustomItemTitle] = useState("")
  const [customItemDesc, setCustomItemDesc] = useState("")
  const [customItemDifficulty, setCustomItemDifficulty] = useState<"easy" | "medium" | "hard">("easy")
  const [customTargetValue, setCustomTargetValue] = useState<number>(0)
  const [customUnitType, setCustomUnitType] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [itemOrder, setItemOrder] = useState<(ListItem | CustomListItem)[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ name?: string; category?: string }>({})
  const [globalItems, setGlobalItems] = useState<ListItem[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  useEffect(() => {
    if (step === 2 && addMode === "search") {
      const loadItems = async () => {
        setIsLoadingItems(true)
        try {
          const { data } = await fetchGlobalItems(listCategory, searchQuery)
          setGlobalItems(data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            difficulty: item.difficulty,
            location: item.location,
            points: item.points,
            target_value: item.target_value,
            unit_type: item.unit_type
          })))
        } catch (error) {
          console.error("Failed to fetch items", error)
        } finally {
          setIsLoadingItems(false)
        }
      }

      // Debounce search
      const timer = setTimeout(loadItems, 300)
      return () => clearTimeout(timer)
    }
  }, [step, addMode, listCategory, searchQuery])

  // Reset custom fields when category changes or mode changes
  useEffect(() => {
    if (listCategory === 'books') {
      setCustomUnitType('chapters')
      setCustomTargetValue(0)
    } else {
      setCustomUnitType('')
      setCustomTargetValue(0)
    }
  }, [listCategory])


  const totalPoints = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.points, 0)
  }, [selectedItems])

  const handleSelectItem = (item: ListItem) => {
    if (selectedItems.find((i) => i.id === item.id)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const handleAddCustomItem = () => {
    const titleValidation = validateItemTitle(customItemTitle)
    if (!titleValidation.isValid) {
      toast({
        title: "Validation Error",
        description: titleValidation.error,
        variant: "destructive",
      })
      return
    }

    const newItem: CustomListItem = {
      id: `custom-${Date.now()}`,
      title: customItemTitle,
      description: customItemDesc,
      difficulty: customItemDifficulty,
      target_value: customTargetValue > 0 ? customTargetValue : undefined,
      unit_type: customUnitType || undefined,
    }
    setCustomItems([...customItems, newItem])
    setCustomItemTitle("")
    setCustomItemDesc("")
    setCustomItemDifficulty("easy")
    setCustomTargetValue(0)
    if (listCategory !== 'books') setCustomUnitType("")
  }

  const validateStep1 = () => {
    const errors: { name?: string; category?: string } = {}

    const nameValidation = validateListName(listName)
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error
    }

    const categoryValidation = validateCategory(listCategory)
    if (!categoryValidation.isValid) {
      errors.category = categoryValidation.error
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateList = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a bucket list",
        variant: "destructive",
      })
      router.push("/auth/login")
      return
    }

    setIsSubmitting(true)

    try {
      // Insert bucket list
      const { data: bucketList, error: listError } = await supabase
        .from("bucket_lists")
        .insert({
          user_id: user.id,
          name: listName.trim(),
          description: description.trim() || null,
          category: listCategory,
          is_public: isPublic,
        })
        .select()
        .single()

      if (listError) {
        throw listError
      }

      // Insert bucket items
      if (itemOrder.length > 0) {
        const itemsToInsert = itemOrder.map((item) => ({
          bucket_list_id: bucketList.id,
          title: item.title,
          description: item.description || null,
          points: "points" in item ? item.points : 0,
          difficulty: item.difficulty || null,
          location: "location" in item ? item.location : null,
          target_value: item.target_value || 0,
          unit_type: item.unit_type || null,
          current_value: 0,
        }))

        const { error: itemsError } = await supabase
          .from("bucket_items")
          .insert(itemsToInsert)

        if (itemsError) {
          throw itemsError
        }
      }

      // Create timeline event
      await supabase.from("timeline_events").insert({
        user_id: user.id,
        event_type: "list_created",
        title: `Created: ${listName}`,
        description: `Started a new ${listCategory} bucket list`,
        metadata: {
          list_id: bucketList.id,
          category: listCategory,
          items_count: itemOrder.length,
        },
        is_public: isPublic,
      })

      // Automatically follow the created list
      const { error: followError } = await supabase
        .from('list_followers')
        .insert({
          user_id: user.id,
          bucket_list_id: bucketList.id,
        })

      if (followError) {
        console.error('Error following created list:', followError)
        // We don't block the success flow if following fails, but we log it
      }

      toast({
        title: "Success!",
        description: "Your bucket list has been created",
      })

      router.push(`/list/${bucketList.id}`)
    } catch (error: any) {
      const apiError = handleSupabaseError(error)
      toast({
        title: "Error",
        description: formatErrorMessage(apiError),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
    } else if (step === 2) {
      if (selectedItems.length > 0 || customItems.length > 0) {
        setItemOrder([...selectedItems, ...customItems])
        setStep(3)
      }
    } else if (step === 3) {
      handleCreateList()
    }
  }

  const filteredItems = globalItems

  const isStep1Valid = listName.trim().length > 0
  const isStep2Valid = selectedItems.length > 0 || customItems.length > 0
  const isStep3Valid = true

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Create Your Bucket List</h1>
          <p className="text-lg text-muted-foreground">Build a personalized list and start your journey</p>
        </div>

        {step === 1 && (
          <WizardStep
            step={1}
            title="Basic Information"
            description="Give your list a name and choose a category"
            onNext={handleNext}
            onBack={() => { }}
            isLastStep={false}
            isNextDisabled={!isStep1Valid}
          >
            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-base font-semibold mb-2 block">
                  List Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Travel the World"
                  value={listName}
                  onChange={(e) => {
                    setListName(e.target.value)
                    if (validationErrors.name) {
                      setValidationErrors({ ...validationErrors, name: undefined })
                    }
                  }}
                  className="h-11"
                />
                {validationErrors.name && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">Category</Label>
                <div className="grid grid-cols-2 gap-3">
                  {categoriesList.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setListCategory(cat.id as Category)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${listCategory === cat.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <p className="font-semibold mt-1">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold mb-2 block">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="What's this list about? What will you accomplish?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-24"
                />
              </div>

              {isAdmin && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-semibold">Make Public</p>
                    <p className="text-sm text-muted-foreground">Others can find and follow your list</p>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              )}
            </div>
          </WizardStep>
        )}

        {step === 2 && (
          <WizardStep
            step={2}
            title="Add Items"
            description="Add existing items or create custom ones"
            onNext={handleNext}
            onBack={() => setStep(1)}
            isLastStep={false}
            isNextDisabled={!isStep2Valid}
          >
            <div className="space-y-6">
              {/* Mode Selection */}
              <div className="flex gap-2 border-b border-border pb-4">
                <Button
                  variant={addMode === "search" ? "default" : "ghost"}
                  onClick={() => setAddMode("search")}
                  className="gap-2"
                >
                  🔍 Search Items
                </Button>
                <Button
                  variant={addMode === "custom" ? "default" : "ghost"}
                  onClick={() => setAddMode("custom")}
                  className="gap-2"
                >
                  ✏️ Create Custom
                </Button>
              </div>

              {addMode === "search" ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Search available items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {isLoadingItems ? (
                      <div className="text-center py-8 text-muted-foreground">Loading items...</div>
                    ) : filteredItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No items found. Try a different search or create a custom item.</div>
                    ) : (
                      filteredItems.map((item) => (
                        <Card
                          key={item.id}
                          className={`cursor-pointer transition-all hover:border-primary ${selectedItems.find((i) => i.id === item.id) ? "border-primary bg-primary/5" : ""}`}
                          onClick={() => handleSelectItem(item)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="checkbox"
                                  checked={!!selectedItems.find((i) => i.id === item.id)}
                                  onChange={() => { }}
                                  className="w-5 h-5"
                                />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  {item.difficulty && (
                                    <Badge variant="secondary" className="text-xs">
                                      {item.difficulty}
                                    </Badge>
                                  )}
                                  {item.location && (
                                    <Badge variant="outline" className="text-xs gap-1">
                                      📍 {item.location}
                                    </Badge>
                                  )}
                                  {item.unit_type && (
                                    <Badge variant="outline" className="text-xs gap-1">
                                      📊 {item.target_value} {item.unit_type}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <Badge className="shrink-0 bg-primary text-primary-foreground">+{item.points}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    placeholder="Item title"
                    value={customItemTitle}
                    onChange={(e) => setCustomItemTitle(e.target.value)}
                  />
                  <Textarea
                    placeholder="Item description (optional)"
                    value={customItemDesc}
                    onChange={(e) => setCustomItemDesc(e.target.value)}
                    className="min-h-16"
                  />
                  <Select value={customItemDifficulty} onValueChange={(val: any) => setCustomItemDifficulty(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs mb-1 block">Target Value (Optional)</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 20"
                        value={customTargetValue || ""}
                        onChange={(e) => setCustomTargetValue(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Unit (e.g. chapters)</Label>
                      <Input
                        placeholder="e.g. chapters"
                        value={customUnitType}
                        onChange={(e) => setCustomUnitType(e.target.value)}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">Custom items don&apos;t earn points</p>
                  <Button onClick={handleAddCustomItem} className="w-full gap-2">
                    + Add Item
                  </Button>
                </div>
              )}

              {/* Summary */}
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">Items selected: {selectedItems.length + customItems.length}</p>
                  <p className="text-primary font-bold">{totalPoints} total points</p>
                </div>
                {(selectedItems.length > 0 || customItems.length > 0) && (
                  <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                    {[...selectedItems, ...customItems].map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-muted-foreground">
                        <span>{item.title}</span>
                        {"points" in item && <span className="text-primary">+{item.points}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </WizardStep>
        )}

        {step === 3 && (
          <WizardStep
            step={3}
            title="Review & Create"
            description="Make sure everything looks good"
            onNext={handleNext}
            onBack={() => setStep(2)}
            isLastStep={true}
            isNextDisabled={!isStep3Valid}
            isLoading={isSubmitting}
          >
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">List Name</p>
                      <p className="font-display font-bold text-lg">{listName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-semibold">{categoriesList.find((c) => c.id === listCategory)?.label}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-foreground">{description || "No description"}</p>
                    </div>
                    <div className="pt-2">
                      <Badge variant={isPublic ? "default" : "secondary"}>
                        {isPublic ? "🌍 Public" : "🔒 Private (Only visible to you)"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-3">Items ({itemOrder.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {itemOrder.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                        <span className="text-sm">
                          {idx + 1}. {item.title}
                        </span>
                        {"points" in item && <span className="text-primary font-semibold">+{item.points}</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <span className="font-semibold">Total Points</span>
                    <span className="text-primary font-bold text-lg">{totalPoints}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </WizardStep>
        )}
      </div>
    </div>
  )
}
