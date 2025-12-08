import { Badge } from '@/components/ui/badge'
import type { BlogCategory } from '@/types/blog'

interface CategoryBadgeProps {
    category: BlogCategory
    className?: string
}

const categoryConfig: Record<BlogCategory, { label: string; className: string }> = {
    guide: {
        label: 'Guide',
        className: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400',
    },
    challenge: {
        label: 'Challenge',
        className: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400',
    },
    inspiration: {
        label: 'Inspiration',
        className: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400',
    },
    'how-to': {
        label: 'How-To',
        className: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400',
    },
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
    const config = categoryConfig[category] || {
        label: category || 'Unknown',
        className: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 dark:bg-gray-500/20 dark:text-gray-400'
    }

    return (
        <Badge variant="secondary" className={`${config.className} ${className || ''}`}>
            {config.label}
        </Badge>
    )
}
