"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, Plus, Upload, Trash2 } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as BadgeType, createBadge, updateBadge, uploadBadgeIcon } from "@/lib/bucket-list-service"
import { useBadges } from "@/hooks/use-badges"
import { handleSupabaseError, formatErrorMessage } from "@/lib/error-handler"
import { Pencil } from "lucide-react"

const badgeSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    criteriaType: z.string().default("manual"),
    criteriaThreshold: z.string().optional(),
})

export function AdminBadgeManager() {
    const { badges, isLoading, mutate } = useBadges()
    const [isOpen, setIsOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingBadge, setEditingBadge] = useState<BadgeType | null>(null)
    const [iconFile, setIconFile] = useState<File | null>(null)
    const [iconPreview, setIconPreview] = useState<string | null>(null)

    const form = useForm<z.infer<typeof badgeSchema>>({
        resolver: zodResolver(badgeSchema),
        defaultValues: {
            name: "",
            description: "",
            criteriaType: "manual",
            criteriaThreshold: "0",
        },
    })

    // Reset form when dialog opens/closes or editingBadge changes
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setEditingBadge(null)
            form.reset({
                name: "",
                description: "",
                criteriaType: "manual",
                criteriaThreshold: "0",
            })
            setIconFile(null)
            setIconPreview(null)
        }
    }

    const handleEdit = (badge: BadgeType) => {
        setEditingBadge(badge)
        form.reset({
            name: badge.name,
            description: badge.description || "",
            criteriaType: badge.criteria?.type || "manual",
            criteriaThreshold: badge.criteria?.threshold?.toString() || "0",
        })
        setIconPreview(badge.icon_url)
        setIsOpen(true)
    }

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setIconFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setIconPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (values: z.infer<typeof badgeSchema>) => {
        if (!iconFile && !editingBadge) {
            toast.error("Please upload a badge icon")
            return
        }

        try {
            setIsSubmitting(true)

            let iconUrl = editingBadge?.icon_url

            // 1. Upload icon if changed
            if (iconFile) {
                iconUrl = await uploadBadgeIcon(iconFile)
            }

            if (!iconUrl) throw new Error("Icon URL is missing")

            // 2. Prepare data
            const criteria = {
                type: values.criteriaType,
                threshold: values.criteriaThreshold ? parseInt(values.criteriaThreshold) : 0
            }

            const badgeData = {
                name: values.name,
                description: values.description || null,
                icon_url: iconUrl,
                criteria: criteria,
            }

            // 3. Create or Update
            if (editingBadge) {
                await updateBadge(editingBadge.id, badgeData)
                toast.success("Badge updated successfully")
            } else {
                await createBadge(badgeData)
                toast.success("Badge created successfully")
            }

            handleOpenChange(false)
            mutate() // Refresh list
        } catch (error) {
            const apiError = handleSupabaseError(error)
            toast.error(formatErrorMessage(apiError))
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">All Badges ({badges?.length || 0})</h3>
                <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Badge
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBadge ? "Edit Badge" : "Create New Badge"}</DialogTitle>
                            <DialogDescription>
                                {editingBadge ? "Update badge details and criteria." : "Add a new achievement badge to the system."}
                            </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Icon Upload */}
                                <div className="flex justify-center mb-4">
                                    <div className="relative size-24 border-2 border-dashed border-muted-foreground/25 rounded-xl flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors cursor-pointer" onClick={() => document.getElementById("badge-icon-upload")?.click()}>
                                        {iconPreview ? (
                                            <Image src={iconPreview} alt="Preview" fill className="object-cover" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">Upload Icon</span>
                                            </div>
                                        )}
                                        <input
                                            id="badge-icon-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleIconChange}
                                        />
                                    </div>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Early Bird" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Badge description..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="criteriaType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="manual">Manual</SelectItem>
                                                        <SelectItem value="items_completed">Items Completed</SelectItem>
                                                        <SelectItem value="lists_created">Lists Created</SelectItem>
                                                        <SelectItem value="followers">Followers</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="criteriaThreshold"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Threshold</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g. 10" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingBadge ? "Update Badge" : "Create Badge"}
                                </Button>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges?.map((badge) => (
                    <Card key={badge.id} className="overflow-hidden group relative">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => handleEdit(badge)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardContent className="p-4 flex items-start gap-4">
                            <div className="relative size-12 shrink-0 rounded-lg overflow-hidden bg-muted">
                                <Image src={badge.icon_url} alt={badge.name} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{badge.name}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {badge.description}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
