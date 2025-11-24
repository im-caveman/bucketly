/**
 * Sanitization utilities for user-generated content
 * 
 * This module provides functions to sanitize user input and prevent XSS attacks.
 * All user-generated content should be sanitized before being displayed in the UI.
 */

/**
 * Sanitizes text for safe display in React components
 * Use this for displaying user-generated text content
 */
export function sanitizeText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitizes multiline text content (like reflections and descriptions)
 * Preserves line breaks but removes dangerous content
 */
export function sanitizeMultilineText(text: string): string {
  if (!text) return ''
  
  // Remove script tags and their content
  let sanitized = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  // Escape HTML special characters
  return sanitizeText(sanitized)
}

/**
 * Sanitizes URL to prevent XSS via javascript: or data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  const trimmedUrl = url.trim()
  
  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i
  if (dangerousProtocols.test(trimmedUrl)) {
    return ''
  }
  
  // Only allow http, https, mailto, and relative URLs
  const safeProtocols = /^(https?:|mailto:|\/|\.\/|\.\.\/)/i
  if (safeProtocols.test(trimmedUrl) || !trimmedUrl.includes(':')) {
    return trimmedUrl
  }
  
  // Block anything else
  return ''
}

/**
 * Sanitizes filename to prevent directory traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return ''
  
  // Remove directory traversal attempts
  let sanitized = filename.replace(/\.\./g, '')
  sanitized = sanitized.replace(/[\/\\]/g, '')
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Limit to alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')
  
  // Prevent hidden files
  if (sanitized.startsWith('.')) {
    sanitized = '_' + sanitized.substring(1)
  }
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop()
    const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'))
    sanitized = nameWithoutExt.substring(0, 250) + '.' + extension
  }
  
  return sanitized || 'file'
}

/**
 * Validates and sanitizes JSON metadata
 * Ensures metadata doesn't contain executable code
 */
export function sanitizeMetadata(metadata: unknown): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object') {
    return {}
  }
  
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(metadata)) {
    // Sanitize key
    const sanitizedKey = sanitizeText(key)
    
    // Sanitize value based on type
    if (typeof value === 'string') {
      sanitized[sanitizedKey] = sanitizeText(value)
    } else if (typeof value === 'number' || typeof value === 'boolean') {
      sanitized[sanitizedKey] = value
    } else if (Array.isArray(value)) {
      sanitized[sanitizedKey] = value.map(item => 
        typeof item === 'string' ? sanitizeText(item) : item
      )
    } else if (value && typeof value === 'object') {
      sanitized[sanitizedKey] = sanitizeMetadata(value)
    }
  }
  
  return sanitized
}

/**
 * Strips all HTML tags from text
 * Use this when you want plain text only
 */
export function stripHtml(html: string): string {
  if (!html) return ''
  
  // Remove all HTML tags
  let text = html.replace(/<[^>]*>/g, '')
  
  // Decode common HTML entities
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
  
  return text
}

/**
 * Validates that a string doesn't contain SQL injection attempts
 * Note: This is a defense-in-depth measure. Primary protection is parameterized queries.
 */
export function detectSqlInjection(input: string): boolean {
  if (!input) return false
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /('|")\s*(OR|AND)\s*('|")/i,
    /(UNION.*SELECT)/i,
    /(;.*DROP)/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

/**
 * Sanitizes search query input
 * Removes special characters that could cause issues
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return ''
  
  // Remove special regex characters
  let sanitized = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // Limit length
  if (sanitized.length > 100) {
    sanitized = sanitized.substring(0, 100)
  }
  
  return sanitized.trim()
}

/**
 * Creates a safe display name from user input
 * Useful for usernames and list names
 */
export function createSafeDisplayName(name: string): string {
  if (!name) return ''
  
  // Remove HTML and scripts
  let safe = stripHtml(name)
  
  // Remove control characters
  safe = safe.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Trim whitespace
  safe = safe.trim()
  
  // Limit length
  if (safe.length > 100) {
    safe = safe.substring(0, 100)
  }
  
  return safe
}

/**
 * Sanitizes photo URLs from storage
 * Ensures URLs are from trusted sources
 */
export function sanitizePhotoUrl(url: string, allowedDomains: string[]): string {
  if (!url) return ''
  
  try {
    const urlObj = new URL(url)
    
    // Check if domain is in allowed list
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    )
    
    if (!isAllowed) {
      console.warn('Photo URL from untrusted domain:', urlObj.hostname)
      return ''
    }
    
    return url
  } catch (error) {
    // Invalid URL
    return ''
  }
}

/**
 * Sanitizes user bio/description for display
 */
export function sanitizeBio(bio: string): string {
  if (!bio) return ''
  
  // Use multiline sanitization
  let sanitized = sanitizeMultilineText(bio)
  
  // Limit length
  if (sanitized.length > 500) {
    sanitized = sanitized.substring(0, 500)
  }
  
  return sanitized
}

/**
 * Sanitizes reflection text for memories
 */
export function sanitizeReflection(reflection: string): string {
  if (!reflection) return ''
  
  // Use multiline sanitization
  let sanitized = sanitizeMultilineText(reflection)
  
  // Limit length
  if (sanitized.length > 5000) {
    sanitized = sanitized.substring(0, 5000)
  }
  
  return sanitized
}
