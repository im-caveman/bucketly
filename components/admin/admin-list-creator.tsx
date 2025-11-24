"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Category, Difficulty } from "@/types/supabase"
import { createAdminNotification } from "@/lib/notification-service"

interface BucketItemInput {
    id: string
    title: string
    description: string
    points: number
    difficulty: Difficulty | ""
    location: string
}

export function AdminListCreator() {
    const { user } = useAuth()
    const [isCreating, setIsCreating] = useState(false)

    // List details
    const [listName, setListName] = useState("")
    const [listDescription, setListDescription] = useState("")
    const [category, setCategory] = useState<Category | "">("")

    // Items
    const [items, setItems] = useState<BucketItemInput[]>([
        { id: crypto.randomUUID(), title: "", description: "", points: 50, difficulty: "", location: "" }
    ])

    const addItem = () => {
        setItems([...items, {
            id: crypto.randomUUID(),
            title: "",
            description: "",
            points: 50,
            difficulty: "",
            location: ""
        }])
    }

    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id))
        }
    }

    const updateItem = (id: string, field: keyof BucketItemInput, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!user) {
            toast.error("You must be logged in to create lists")
            return
        }

        if (!listName.trim() || !category) {
            toast.error("Please fill in list name and category")
            return
        }

        const validItems = items.filter(item => item.title.trim())
        if (validItems.length === 0) {
            toast.error("Please add at least one item")
            return
        }

        setIsCreating(true)

        try {
            // Create the bucket list (public by default for admin)
            const { data: newList, error: listError } = await supabase
                .from('bucket_lists')
                .insert({
                    user_id: user.id,
                    name: listName.trim(),
                    description: listDescription.trim() || null,
                    category: category as Category,
                    is_public: true, // Admin lists are always public
                })
                .select()
                .single()

            if (listError) throw listError

            // Create the bucket items
            const itemsToInsert = validItems.map(item => ({
                bucket_list_id: newList.id,
                title: item.title.trim(),
                description: item.description.trim() || null,
                points: item.points,
                difficulty: item.difficulty || null,
                location: item.location.trim() || null,
            }))

            const { error: itemsError } = await supabase
                .from('bucket_items')
                .insert(itemsToInsert)

            if (itemsError) throw itemsError

            // Create admin notification for all users
            try {
                await createAdminNotification(
                    `🎉 New Public List: ${listName}`,
                    `A new ${category} bucket list "${listName}" with ${validItems.length} items has been added! Check it out on the Explore page.`,
                    'success',
                    'medium',
                    {
                        list_id: newList.id,
                        list_name: listName,
                        category: category,
                        item_count: validItems.length,
                    }
                )
            } catch (notifError) {
                // Don't fail the list creation if notification fails
                console.error('Error creating notification:', notifError)
            }

            toast.success(`Public list "${listName}" created successfully!`)

            // Reset form
            setListName("")
            setListDescription("")
            setCategory("")
            setItems([{ id: crypto.randomUUID(), title: "", description: "", points: 50, difficulty: "", location: "" }])
        } catch (error: any) {
            console.error('Error creating list:', error)
            toast.error(error.message || "Failed to create list")
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* List Details */}
            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="list-name" className="text-base font-semibold">List Name *</Label>
                    <Input
                        id="list-name"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="e.g., Top 10 Adventures in Asia"
                        required
                        className="h-11"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="list-description" className="text-base font-semibold">Description</Label>
                    <Textarea
                        id="list-description"
                        value={listDescription}
                        onChange={(e) => setListDescription(e.target.value)}
                        placeholder="Describe this bucket list..."
                        rows={3}
                        className="min-h-24"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category" className="text-base font-semibold">Category *</Label>
                    <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                        <SelectTrigger id="category" className="h-11">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="adventures">🎯 Adventures</SelectItem>
                            <SelectItem value="places">🌍 Places</SelectItem>
                            <SelectItem value="cuisines">🍽️ Cuisines</SelectItem>
                            <SelectItem value="books">📚 Books</SelectItem>
                            <SelectItem value="songs">🎵 Songs</SelectItem>
                            <SelectItem value="monuments">🏛️ Monuments</SelectItem>
                            <SelectItem value="acts-of-service">🤝 Acts of Service</SelectItem>
                            <SelectItem value="miscellaneous">✨ Miscellaneous</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <Label className="text-base font-semibold">Bucket List Items *</Label>
                    <Button type="button" onClick={addItem} size="sm" variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={item.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-sm">Item {index + 1}</h4>
                                    {items.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <Input
                                    value={item.title}
                                    onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                    placeholder="Item title *"
                                    className="h-10"
                                />

                                <Textarea
                                    value={item.description}
                                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    placeholder="Item description (optional)"
                                    rows={2}
                                    className="min-h-16"
                                />

                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <Label className="text-xs mb-1 block">Points</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="1000"
                                            value={item.points}
                                            onChange={(e) => updateItem(item.id, 'points', parseInt(e.target.value) || 50)}
                                            className="h-9"
                                        />
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1 block">Difficulty</Label>
                                        <Select
                                            value={item.difficulty}
                                            onValueChange={(value) => updateItem(item.id, 'difficulty', value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Optional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="easy">Easy</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="hard">Hard</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <Label className="text-xs mb-1 block">Location</Label>
                                        <Input
                                            value={item.location}
                                            onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                                            placeholder="Optional"
                                            className="h-9"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Button type="submit" disabled={isCreating} className="w-full h-11">
                {isCreating ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                    </>
                ) : (
                    "Create Public List"
                )}
            </Button>
        </form>
    )
}
