# Frontend Developer Guide

## Overview

This guide provides patterns and best practices for frontend developers working with the Bucket List application. It covers authentication patterns, data fetching strategies, error handling, and common implementation patterns.

## Table of Contents

- [Getting Started](#getting-started)
- [Authentication Patterns](#authentication-patterns)
- [Data Fetching Patterns](#data-fetching-patterns)
- [Error Handling Patterns](#error-handling-patterns)
- [State Management](#state-management)
- [Form Handling](#form-handling)
- [File Upload Patterns](#file-upload-patterns)
- [Real-time Updates](#real-time-updates)
- [Performance Optimization](#performance-optimization)
- [Security Best Practices](#security-best-practices)
- [Testing Patterns](#testing-patterns)
- [Common Pitfalls](#common-pitfalls)

## Getting Started

### Project Structure

```
app/                    # Next.js app directory
  auth/                # Authentication pages
  profile/             # Profile pages
  list/                # Bucket list pages
components/            # React components
  auth/               # Auth-related components
  bucket-list/        # Bucket list components
  ui/                 # Reusable UI components
contexts/             # React contexts
  auth-context.tsx   # Authentication context
hooks/                # Custom React hooks
  use-bucket-lists.ts
  use-profile.ts
lib/                  # Utility libraries
  supabase.ts        # Supabase client
  error-handler.ts   # Error handling
  validation.ts      # Input validation
  sanitization.ts    # Content sanitization
types/                # TypeScript types
  supabase.ts        # Generated database types
```

### Setup Checklist

- [ ] Environment variables configured in `.env.local`
- [ ] Supabase client initialized in `lib/supabase.ts`
- [ ] TypeScript types generated from database schema
- [ ] Authentication context set up
- [ ] Error handling utilities imported

## Authentication Patterns

### Using the Auth Context

The application uses a React Context for authentication state management.

**Setup:**
```typescript
// contexts/auth-context.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signUp: async (email: string, password: string, username: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
      })
      if (error) throw error
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```


**Usage in Components:**
```typescript
'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### Protected Routes

**Pattern 1: Client-Side Protection**
```typescript
'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return null
  }

  return <div>Protected content</div>
}
```

**Pattern 2: Server-Side Protection (Middleware)**
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protect routes
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/settings/:path*']
}
```

## Data Fetching Patterns

### Using SWR for Data Fetching

SWR provides caching, revalidation, and automatic refetching.

**Installation:**
```bash
npm install swr
```

**Setup SWR Provider:**
```typescript
// contexts/swr-config-provider.tsx
'use client'

import { SWRConfig } from 'swr'

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 60000, // 1 minute
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  )
}
```

**Custom Hook Pattern:**
```typescript
// hooks/use-bucket-lists.ts
import useSWR from 'swr'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type BucketList = Database['public']['Tables']['bucket_lists']['Row']

export function useBucketLists(userId?: string) {
  const { data, error, mutate, isLoading } = useSWR<BucketList[]>(
    userId ? ['bucket-lists', userId] : null,
    async () => {
      const { data, error } = await supabase
        .from('bucket_lists')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }
  )

  return {
    lists: data,
    isLoading,
    isError: error,
    mutate,
  }
}
```


**Using the Hook:**
```typescript
'use client'

import { useBucketLists } from '@/hooks/use-bucket-lists'
import { useAuth } from '@/contexts/auth-context'

export function MyListsPage() {
  const { user } = useAuth()
  const { lists, isLoading, isError, mutate } = useBucketLists(user?.id)

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error loading lists</div>

  return (
    <div>
      {lists?.map(list => (
        <div key={list.id}>{list.name}</div>
      ))}
    </div>
  )
}
```

### Optimistic Updates

Update UI immediately before server confirmation.

```typescript
async function deleteList(listId: string) {
  // Optimistically update UI
  mutate(
    lists?.filter(list => list.id !== listId),
    false // Don't revalidate yet
  )

  try {
    // Perform actual deletion
    const { error } = await supabase
      .from('bucket_lists')
      .delete()
      .eq('id', listId)

    if (error) throw error

    // Revalidate to confirm
    mutate()
  } catch (error) {
    // Revert on error
    mutate()
    throw error
  }
}
```

### Pagination Pattern

```typescript
export function usePaginatedLists(pageSize = 20) {
  const [page, setPage] = useState(0)

  const { data, error, isLoading } = useSWR(
    ['bucket-lists-paginated', page],
    async () => {
      const from = page * pageSize
      const to = from + pageSize - 1

      const { data, error, count } = await supabase
        .from('bucket_lists')
        .select('*', { count: 'exact' })
        .eq('is_public', true)
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { lists: data, total: count }
    }
  )

  return {
    lists: data?.lists,
    total: data?.total,
    page,
    setPage,
    isLoading,
    isError: error,
    hasMore: data ? (page + 1) * pageSize < data.total : false,
  }
}
```

## Error Handling Patterns

### Centralized Error Handler

```typescript
// lib/error-handler.ts
import { PostgrestError } from '@supabase/supabase-js'

export interface ApiError {
  code: string
  message: string
  details?: string
}

export function handleSupabaseError(error: PostgrestError): ApiError {
  // Not found
  if (error.code === 'PGRST116') {
    return {
      code: '404',
      message: 'Resource not found',
    }
  }

  // Unique constraint violation
  if (error.code === '23505') {
    return {
      code: '409',
      message: 'This resource already exists',
      details: error.details,
    }
  }

  // Foreign key violation
  if (error.code === '23503') {
    return {
      code: '409',
      message: 'Cannot delete resource with dependencies',
      details: error.details,
    }
  }

  // Insufficient privilege
  if (error.code === '42501') {
    return {
      code: '403',
      message: 'You do not have permission to perform this action',
    }
  }

  // JWT expired
  if (error.code === 'PGRST301') {
    return {
      code: '401',
      message: 'Your session has expired. Please log in again.',
    }
  }

  // Default error
  return {
    code: '500',
    message: 'An unexpected error occurred',
    details: error.message,
  }
}
```

### Error Handling in Components

```typescript
'use client'

import { useState } from 'react'
import { handleSupabaseError } from '@/lib/error-handler'
import { useToast } from '@/hooks/use-toast'

export function CreateListForm() {
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (data: any) => {
    setError(null)

    try {
      const { error: supabaseError } = await supabase
        .from('bucket_lists')
        .insert(data)

      if (supabaseError) {
        const apiError = handleSupabaseError(supabaseError)
        setError(apiError.message)
        toast({
          title: 'Error',
          description: apiError.message,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'List created successfully',
      })
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
    </form>
  )
}
```

### Error Boundaries

```typescript
// components/error-boundary.tsx
'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

## State Management

### Local State with useState

For component-specific state:

```typescript
function ItemCard({ item }: { item: BucketItem }) {
  const [completed, setCompleted] = useState(item.completed)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('bucket_items')
        .update({ completed: !completed })
        .eq('id', item.id)

      if (error) throw error
      setCompleted(!completed)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <input
        type="checkbox"
        checked={completed}
        onChange={handleToggle}
        disabled={loading}
      />
      {item.title}
    </div>
  )
}
```

### Global State with Context

For app-wide state:

```typescript
// contexts/theme-context.tsx
'use client'

import { createContext, useContext, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
```

## Form Handling

### Form Validation

```typescript
// lib/validation.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
}

export function validateBucketListName(name: string): boolean {
  return name.length >= 3 && name.length <= 100
}

export function validatePoints(points: number): boolean {
  return points >= 1 && points <= 1000
}

export function validateReflection(text: string): boolean {
  return text.length >= 10 && text.length <= 5000
}
```

### Form Component Pattern

```typescript
'use client'

import { useState } from 'react'
import { validateBucketListName, validatePoints } from '@/lib/validation'

interface FormData {
  name: string
  description: string
  category: string
  points: number
}

interface FormErrors {
  name?: string
  points?: string
}

export function CreateItemForm({ listId }: { listId: string }) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: 'adventures',
    points: 50,
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    if (!validateBucketListName(formData.name)) {
      newErrors.name = 'Name must be 3-100 characters'
    }

    if (!validatePoints(formData.points)) {
      newErrors.points = 'Points must be 1-1000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('bucket_items')
        .insert({
          bucket_list_id: listId,
          title: formData.name,
          description: formData.description,
          points: formData.points,
        })

      if (error) throw error

      // Reset form
      setFormData({ name: '', description: '', category: 'adventures', points: 50 })
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Item name"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <input
          type="number"
          value={formData.points}
          onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
          min={1}
          max={1000}
        />
        {errors.points && <span className="error">{errors.points}</span>}
      </div>

      <button type="submit" disabled={submitting}>
        {submitting ? 'Creating...' : 'Create Item'}
      </button>
    </form>
  )
}
```


## File Upload Patterns

### Image Upload to Supabase Storage

```typescript
// lib/image-optimization.ts
export async function compressImage(file: File, maxSizeMB = 1): Promise<File> {
  // Implementation for image compression
  return file
}

export function validateImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  return validTypes.includes(file.type) && file.size <= maxSize
}
```

### Upload Component

```typescript
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { validateImageFile, compressImage } from '@/lib/image-optimization'

export function PhotoUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file
    if (!validateImageFile(file)) {
      setError('Invalid file. Must be JPEG, PNG, or WebP under 10MB')
      return
    }

    setUploading(true)

    try {
      // Compress image
      const compressedFile = await compressImage(file)

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload to storage
      const fileName = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('memory-photos')
        .upload(fileName, compressedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('memory-photos')
        .getPublicUrl(fileName)

      onUpload(publicUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <div>Uploading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  )
}
```

### Multiple File Upload

```typescript
export function MultiPhotoUpload({ onUpload }: { onUpload: (urls: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)
    const uploadedUrls: string[] = []

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        if (!validateImageFile(file)) continue

        const compressedFile = await compressImage(file)
        const fileName = `${user.id}/${Date.now()}-${i}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('memory-photos')
          .upload(fileName, compressedFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('memory-photos')
          .getPublicUrl(fileName)

        uploadedUrls.push(publicUrl)
        setProgress(((i + 1) / files.length) * 100)
      }

      onUpload(uploadedUrls)
    } catch (err) {
      console.error(err)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <div>Uploading: {progress.toFixed(0)}%</div>}
    </div>
  )
}
```

## Real-time Updates

### Subscribe to Changes

```typescript
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'

type BucketItem = Database['public']['Tables']['bucket_items']['Row']

export function useRealtimeItems(listId: string) {
  const [items, setItems] = useState<BucketItem[]>([])

  useEffect(() => {
    // Initial fetch
    const fetchItems = async () => {
      const { data } = await supabase
        .from('bucket_items')
        .select('*')
        .eq('bucket_list_id', listId)

      if (data) setItems(data)
    }

    fetchItems()

    // Subscribe to changes
    const channel = supabase
      .channel('bucket-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bucket_items',
          filter: `bucket_list_id=eq.${listId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setItems((current) => [...current, payload.new as BucketItem])
          } else if (payload.eventType === 'UPDATE') {
            setItems((current) =>
              current.map((item) =>
                item.id === payload.new.id ? (payload.new as BucketItem) : item
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setItems((current) =>
              current.filter((item) => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [listId])

  return items
}
```

## Performance Optimization

### Lazy Loading Images

```typescript
// components/ui/lazy-image.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function LazyImage({ src, alt, width, height, className }: LazyImageProps) {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className={className}>
      {isVisible ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
        />
      ) : (
        <div className="placeholder" style={{ width, height }} />
      )}
    </div>
  )
}
```

### Debounced Search

```typescript
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Usage
export function SearchLists() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 500)

  const { data } = useSWR(
    debouncedSearch ? ['search', debouncedSearch] : null,
    () => searchBucketLists(debouncedSearch)
  )

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search lists..."
    />
  )
}
```

### Memoization

```typescript
import { useMemo } from 'react'

export function ListStats({ items }: { items: BucketItem[] }) {
  const stats = useMemo(() => {
    const completed = items.filter(item => item.completed).length
    const totalPoints = items.reduce((sum, item) => sum + item.points, 0)
    const earnedPoints = items
      .filter(item => item.completed)
      .reduce((sum, item) => sum + item.points, 0)

    return { completed, total: items.length, totalPoints, earnedPoints }
  }, [items])

  return (
    <div>
      <p>Completed: {stats.completed} / {stats.total}</p>
      <p>Points: {stats.earnedPoints} / {stats.totalPoints}</p>
    </div>
  )
}
```

## Security Best Practices

### Input Sanitization

```typescript
// lib/sanitization.ts
import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  })
}

export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
}

// Usage
export function DisplayUserContent({ content }: { content: string }) {
  const sanitized = sanitizeHtml(content)

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
```

### XSS Prevention

```typescript
// Always sanitize user input before displaying
import { sanitizeText } from '@/lib/sanitization'

export function UserBio({ bio }: { bio: string }) {
  const safeBio = sanitizeText(bio)
  return <p>{safeBio}</p>
}

// For rich text, use sanitizeHtml
import { sanitizeHtml } from '@/lib/sanitization'

export function UserReflection({ reflection }: { reflection: string }) {
  const safeReflection = sanitizeHtml(reflection)
  return <div dangerouslySetInnerHTML={{ __html: safeReflection }} />
}
```

### CSRF Protection

Next.js and Supabase handle CSRF protection automatically through:
- JWT tokens in Authorization headers
- SameSite cookie attributes
- Origin validation

### Rate Limiting

Implement client-side rate limiting for API calls:

```typescript
class RateLimiter {
  private requests: number[] = []
  private limit: number
  private window: number

  constructor(limit: number, windowMs: number) {
    this.limit = limit
    this.window = windowMs
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.window)

    if (this.requests.length < this.limit) {
      this.requests.push(now)
      return true
    }

    return false
  }
}

// Usage
const limiter = new RateLimiter(10, 60000) // 10 requests per minute

async function makeApiCall() {
  if (!limiter.canMakeRequest()) {
    throw new Error('Rate limit exceeded')
  }

  // Make API call
}
```

## Testing Patterns

### Unit Testing Components

```typescript
// __tests__/components/item-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ItemCard } from '@/components/bucket-list/item-card'

describe('ItemCard', () => {
  const mockItem = {
    id: '1',
    title: 'Test Item',
    completed: false,
    points: 50,
  }

  it('renders item title', () => {
    render(<ItemCard item={mockItem} />)
    expect(screen.getByText('Test Item')).toBeInTheDocument()
  })

  it('toggles completion status', async () => {
    const onToggle = jest.fn()
    render(<ItemCard item={mockItem} onToggle={onToggle} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(onToggle).toHaveBeenCalledWith('1', true)
  })
})
```

### Integration Testing

```typescript
// __tests__/integration/bucket-list-service.test.ts
import { supabase } from '@/lib/supabase'
import { createBucketList, getBucketLists } from '@/lib/bucket-list-service'

describe('Bucket List Service', () => {
  beforeAll(async () => {
    // Set up test user
  })

  afterAll(async () => {
    // Clean up test data
  })

  it('creates and retrieves bucket list', async () => {
    const listData = {
      name: 'Test List',
      category: 'adventures',
      is_public: true,
    }

    const created = await createBucketList(listData)
    expect(created).toHaveProperty('id')

    const lists = await getBucketLists(userId)
    expect(lists).toContainEqual(expect.objectContaining(listData))
  })
})
```

## Common Pitfalls

### 1. Not Handling Loading States

❌ **Bad:**
```typescript
function MyComponent() {
  const { data } = useSWR('key', fetcher)
  return <div>{data.map(...)}</div> // Error if data is undefined
}
```

✅ **Good:**
```typescript
function MyComponent() {
  const { data, isLoading } = useSWR('key', fetcher)

  if (isLoading) return <div>Loading...</div>
  if (!data) return <div>No data</div>

  return <div>{data.map(...)}</div>
}
```

### 2. Not Cleaning Up Subscriptions

❌ **Bad:**
```typescript
useEffect(() => {
  supabase.channel('changes').subscribe()
}, [])
```

✅ **Good:**
```typescript
useEffect(() => {
  const channel = supabase.channel('changes').subscribe()
  return () => supabase.removeChannel(channel)
}, [])
```

### 3. Exposing Sensitive Data

❌ **Bad:**
```typescript
// Using service role key in client
const supabase = createClient(url, serviceRoleKey)
```

✅ **Good:**
```typescript
// Using anon key in client
const supabase = createClient(url, anonKey)
```

### 4. Not Validating User Input

❌ **Bad:**
```typescript
const { error } = await supabase
  .from('bucket_lists')
  .insert({ name: userInput })
```

✅ **Good:**
```typescript
if (!validateBucketListName(userInput)) {
  throw new Error('Invalid name')
}

const { error } = await supabase
  .from('bucket_lists')
  .insert({ name: sanitizeText(userInput) })
```

### 5. Forgetting Error Handling

❌ **Bad:**
```typescript
const { data } = await supabase.from('bucket_lists').select()
return data
```

✅ **Good:**
```typescript
const { data, error } = await supabase.from('bucket_lists').select()
if (error) throw handleSupabaseError(error)
return data
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [SWR Documentation](https://swr.vercel.app/)
- [React Hook Form](https://react-hook-form.com/)
- [Testing Library](https://testing-library.com/)
