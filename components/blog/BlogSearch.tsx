'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BlogSearchProps {
    onSearch: (query: string) => void
    placeholder?: string
    defaultValue?: string
}

export function BlogSearch({
    onSearch,
    placeholder = 'Search blog posts...',
    defaultValue = ''
}: BlogSearchProps) {
    const [query, setQuery] = useState(defaultValue)
    const [debouncedQuery, setDebouncedQuery] = useState(defaultValue)
    const isInitialMount = useRef(true)

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Trigger search when debounced query changes (skip initial mount)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }
        onSearch(debouncedQuery)
    }, [debouncedQuery, onSearch])

    const handleClear = () => {
        setQuery('')
    }

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 pr-9"
            />
            {query && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
