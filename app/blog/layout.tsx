import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Blog | Bucketly - Bucket List Inspiration & Guides',
    description: 'Discover guides, challenges, and inspiration for your bucket list journey. Learn about popular challenges like 75 Hard, productivity tips, and personal development.',
    keywords: ['bucket list', 'challenges', 'self-improvement', 'productivity', 'guides'],
    openGraph: {
        title: 'Blog | Bucketly',
        description: 'Guides, challenges, and inspiration for your bucket list journey',
        type: 'website',
    },
}

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
