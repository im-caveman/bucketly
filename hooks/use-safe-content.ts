import { useMemo } from 'react'
import { 
  sanitizeText, 
  sanitizeMultilineText, 
  sanitizeUrl,
  sanitizeBio,
  sanitizeReflection,
  createSafeDisplayName
} from '@/lib/sanitization'

/**
 * Hook for safely rendering user-generated text content
 * Automatically sanitizes content to prevent XSS attacks
 */
export function useSafeText(text: string | null | undefined): string {
  return useMemo(() => {
    if (!text) return ''
    return sanitizeText(text)
  }, [text])
}

/**
 * Hook for safely rendering multiline user content
 * Preserves line breaks but removes dangerous content
 */
export function useSafeMultilineText(text: string | null | undefined): string {
  return useMemo(() => {
    if (!text) return ''
    return sanitizeMultilineText(text)
  }, [text])
}

/**
 * Hook for safely rendering URLs
 * Blocks javascript: and data: protocols
 */
export function useSafeUrl(url: string | null | undefined): string {
  return useMemo(() => {
    if (!url) return ''
    return sanitizeUrl(url)
  }, [url])
}

/**
 * Hook for safely rendering user bio
 */
export function useSafeBio(bio: string | null | undefined): string {
  return useMemo(() => {
    if (!bio) return ''
    return sanitizeBio(bio)
  }, [bio])
}

/**
 * Hook for safely rendering reflection text
 */
export function useSafeReflection(reflection: string | null | undefined): string {
  return useMemo(() => {
    if (!reflection) return ''
    return sanitizeReflection(reflection)
  }, [reflection])
}

/**
 * Hook for safely rendering display names
 */
export function useSafeDisplayName(name: string | null | undefined): string {
  return useMemo(() => {
    if (!name) return ''
    return createSafeDisplayName(name)
  }, [name])
}

/**
 * Hook for rendering user content with line breaks preserved
 * Returns an array of sanitized lines
 */
export function useSafeLines(text: string | null | undefined): string[] {
  return useMemo(() => {
    if (!text) return []
    const sanitized = sanitizeMultilineText(text)
    return sanitized.split('\n').filter(line => line.trim() !== '')
  }, [text])
}
