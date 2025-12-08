'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { BlogSearch } from './BlogSearch'

interface BlogSearchWrapperProps {
    defaultValue?: string
}

export function BlogSearchWrapper({ defaultValue }: BlogSearchWrapperProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = (query: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (query) {
            params.set('search', query)
        } else {
            params.delete('search')
        }
        router.push(`/blog?${params.toString()}`)
    }

    return <BlogSearch onSearch={handleSearch} defaultValue={defaultValue} />
}
