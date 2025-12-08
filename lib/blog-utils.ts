import readingTime from 'reading-time'

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .substring(0, 100) // Limit length
}

/**
 * Calculate reading time in minutes from markdown content
 */
export function calculateReadingTime(content: string): number {
    const stats = readingTime(content)
    return Math.ceil(stats.minutes)
}
