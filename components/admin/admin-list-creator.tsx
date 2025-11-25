"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Loader2, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Category, Difficulty } from "@/types/supabase"
import { createAdminNotification } from "@/lib/notification-service"
import type { BucketListWithItems } from "@/lib/bucket-list-service"

interface BucketItemInput {
    id: string
    title: string
    description: string
    points: number
    difficulty: Difficulty | ""
    location: string
}

interface AdminListCreatorProps {
    initialData?: BucketListWithItems
    onSuccess?: () => void
    onCancel?: () => void
}

export function AdminListCreator({ initialData, onSuccess, onCancel }: AdminListCreatorProps) {
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)

    // List details
    const [listName, setListName] = useState(initialData?.name || "")
    const [listDescription, setListDescription] = useState(initialData?.description || "")
    const [category, setCategory] = useState<Category | "">(initialData?.category || "")

    // Items
    const [items, setItems] = useState<BucketItemInput[]>(
        initialData?.bucket_items.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || "",
            points: item.points,
            difficulty: item.difficulty || "",
            location: item.location || ""
        })) || [
            { id: crypto.randomUUID(), title: "", description: "", points: 50, difficulty: "", location: "" }
        ]
    )

    // Reset form when initialData changes (e.g. switching between lists)
    useEffect(() => {
        if (initialData) {
            setListName(initialData.name)
            setListDescription(initialData.description || "")
            setCategory(initialData.category)
            setItems(initialData.bucket_items.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description || "",
                points: item.points,
                difficulty: item.difficulty || "",
                location: item.location || ""
            })))
        } else {
            // Reset to default if switching to create mode
            setListName("")
            setListDescription("")
            setCategory("")
            setItems([{ id: crypto.randomUUID(), title: "", description: "", points: 50, difficulty: "", location: "" }])
        }
    }, [initialData])

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
        } else if (items.length === 1 && !initialData) {
            // If it's the last item and we are creating, just clear it
            setItems([{ id: crypto.randomUUID(), title: "", description: "", points: 50, difficulty: "", location: "" }])
        } else if (items.length === 1 && initialData) {
            toast.error("A list must have at least one item")
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
            toast.error("You must be logged in to manage lists")
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

        setIsSubmitting(true)

        try {
            if (initialData) {
                // UPDATE EXISTING LIST
                const { error: listError } = await supabase
                    .from('bucket_lists')
                    .update({
                        name: listName.trim(),
                        description: listDescription.trim() || null,
                        category: category as Category,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', initialData.id)

                if (listError) throw listError

                // Handle Items
                const originalItemIds = new Set(initialData.bucket_items.map(i => i.id))

                // 1. Delete removed items
                const itemsToDelete = initialData.bucket_items.filter(i => !items.find(currentItem => currentItem.id === i.id))
                if (itemsToDelete.length > 0) {
                    const { error: deleteError } = await supabase
                        .from('bucket_items')
                        .delete()
                        .in('id', itemsToDelete.map(i => i.id))

                    if (deleteError) throw deleteError
                }

                // 2. Update existing items
                const itemsToUpdate = items.filter(i => originalItemIds.has(i.id))
                for (const item of itemsToUpdate) {
                    const { error: updateError } = await supabase
                        .from('bucket_items')
                        .update({
                            title: item.title.trim(),
                            description: item.description.trim() || null,
                            points: item.points,
                            difficulty: item.difficulty || null,
                            location: item.location.trim() || null,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', item.id)

                    if (updateError) throw updateError
                }

                // 3. Insert new items
                const itemsToInsert = items.filter(i => !originalItemIds.has(i.id))
                if (itemsToInsert.length > 0) {
                    const { error: insertError } = await supabase
                        .from('bucket_items')
                        .insert(itemsToInsert.map(item => ({
                            bucket_list_id: initialData.id,
                            title: item.title.trim(),
                            description: item.description.trim() || null,
                            points: item.points,
                            difficulty: item.difficulty || null,
                            location: item.location.trim() || null,
                        })))

                    if (insertError) throw insertError
                }

                toast.success("List updated successfully")
                if (onSuccess) onSuccess()

            } else {
                // CREATE NEW LIST
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

                // Create admin notification
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
                    console.error('Error creating notification:', notifError)
                }

                toast.success(`Public list "${listName}" created successfully!`)

                // Reset form
                setListName("")
                setListDescription("")
                setCategory("")
                setItems([{ id: crypto.randomUUID(), title: "", description: "", points: 50, difficulty: "", location: "" }])

                if (onSuccess) onSuccess()
            }

        } catch (error: any) {
            console.error('Error saving list:', error)
            toast.error(error.message || "Failed to save list")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                    {initialData ? "Edit Public List" : "Create New Public List"}
                </h3>
                {onCancel && (
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                )}
            </div>

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
                                    <Button
                                        type="button"
                                        onClick={() => removeItem(item.id)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                        disabled={items.length === 1 && !!initialData}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
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

            <div className="flex gap-3">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11">
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className="flex-1 h-11">
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {initialData ? "Updating..." : "Creating..."}
                        </>
                    ) : (
                        initialData ? "Update Public List" : "Create Public List"
                    )}
                </Button>
            </div>
        </form>
    )
}

