import { describe, it, expect } from 'vitest'
import {
  sanitizeText,
  sanitizeMultilineText,
  sanitizeUrl,
  sanitizeFilename,
  sanitizeMetadata,
  stripHtml,
  detectSqlInjection,
  sanitizeSearchQuery,
  createSafeDisplayName,
  sanitizeBio,
  sanitizeReflection
} from '../sanitization'

describe('sanitizeText', () => {
  it('should escape HTML special characters', () => {
    const result = sanitizeText('<script>alert("xss")</script>')
    expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
  })

  it('should handle empty string', () => {
    const result = sanitizeText('')
    expect(result).toBe('')
  })

  it('should escape quotes and apostrophes', () => {
    const result = sanitizeText(`"Hello" and 'World'`)
    expect(result).toContain('&quot;')
    expect(result).toContain('&#x27;')
  })
})

describe('sanitizeMultilineText', () => {
  it('should remove script tags', () => {
    const result = sanitizeMultilineText('Hello <script>alert("xss")</script> World')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
  })

  it('should remove style tags', () => {
    const result = sanitizeMultilineText('Hello <style>body{display:none}</style> World')
    expect(result).not.toContain('<style>')
  })

  it('should remove iframe tags', () => {
    const result = sanitizeMultilineText('Hello <iframe src="evil.com"></iframe> World')
    expect(result).not.toContain('<iframe>')
  })

  it('should remove event handlers', () => {
    const result = sanitizeMultilineText('<div onclick="alert()">Click</div>')
    expect(result).not.toContain('onclick')
  })

  it('should remove javascript protocol', () => {
    const result = sanitizeMultilineText('javascript:alert("xss")')
    expect(result).not.toContain('javascript:')
  })
})

describe('sanitizeUrl', () => {
  it('should allow https URLs', () => {
    const result = sanitizeUrl('https://example.com')
    expect(result).toBe('https://example.com')
  })

  it('should allow http URLs', () => {
    const result = sanitizeUrl('http://example.com')
    expect(result).toBe('http://example.com')
  })

  it('should allow relative URLs', () => {
    const result = sanitizeUrl('/path/to/page')
    expect(result).toBe('/path/to/page')
  })

  it('should block javascript protocol', () => {
    const result = sanitizeUrl('javascript:alert("xss")')
    expect(result).toBe('')
  })

  it('should block data protocol', () => {
    const result = sanitizeUrl('data:text/html,<script>alert("xss")</script>')
    expect(result).toBe('')
  })

  it('should block vbscript protocol', () => {
    const result = sanitizeUrl('vbscript:msgbox("xss")')
    expect(result).toBe('')
  })
})

describe('sanitizeFilename', () => {
  it('should allow safe filenames', () => {
    const result = sanitizeFilename('my-file_123.jpg')
    expect(result).toBe('my-file_123.jpg')
  })

  it('should remove directory traversal', () => {
    const result = sanitizeFilename('../../../etc/passwd')
    expect(result).not.toContain('..')
    expect(result).not.toContain('/')
  })

  it('should remove null bytes', () => {
    const result = sanitizeFilename('file\0.jpg')
    expect(result).not.toContain('\0')
  })

  it('should prevent hidden files', () => {
    const result = sanitizeFilename('.hidden')
    expect(result.startsWith('.')).toBe(false)
  })

  it('should limit filename length', () => {
    const longName = 'a'.repeat(300) + '.jpg'
    const result = sanitizeFilename(longName)
    expect(result.length).toBeLessThanOrEqual(255)
  })
})

describe('sanitizeMetadata', () => {
  it('should sanitize string values', () => {
    const metadata = { name: '<script>alert("xss")</script>' }
    const result = sanitizeMetadata(metadata)
    expect(result.name).not.toContain('<script>')
  })

  it('should preserve numbers', () => {
    const metadata = { count: 42 }
    const result = sanitizeMetadata(metadata)
    expect(result.count).toBe(42)
  })

  it('should preserve booleans', () => {
    const metadata = { active: true }
    const result = sanitizeMetadata(metadata)
    expect(result.active).toBe(true)
  })

  it('should sanitize nested objects', () => {
    const metadata = { 
      user: { 
        name: '<script>alert("xss")</script>' 
      } 
    }
    const result = sanitizeMetadata(metadata)
    const user = result.user as Record<string, unknown>
    expect(user.name).not.toContain('<script>')
  })

  it('should handle arrays', () => {
    const metadata = { tags: ['<script>', 'safe'] }
    const result = sanitizeMetadata(metadata)
    const tags = result.tags as string[]
    expect(tags[0]).not.toContain('<script>')
  })
})

describe('stripHtml', () => {
  it('should remove all HTML tags', () => {
    const result = stripHtml('<p>Hello <strong>World</strong></p>')
    expect(result).toBe('Hello World')
  })

  it('should decode HTML entities', () => {
    const result = stripHtml('&lt;div&gt;')
    expect(result).toBe('<div>')
  })

  it('should handle empty string', () => {
    const result = stripHtml('')
    expect(result).toBe('')
  })
})

describe('detectSqlInjection', () => {
  it('should detect SELECT statement', () => {
    const result = detectSqlInjection('SELECT * FROM users')
    expect(result).toBe(true)
  })

  it('should detect DROP statement', () => {
    const result = detectSqlInjection('DROP TABLE users')
    expect(result).toBe(true)
  })

  it('should detect SQL comments', () => {
    const result = detectSqlInjection('admin --')
    expect(result).toBe(true)
  })

  it('should detect OR injection', () => {
    const result = detectSqlInjection("' OR '1'='1")
    expect(result).toBe(true)
  })

  it('should not flag safe input', () => {
    const result = detectSqlInjection('Hello World')
    expect(result).toBe(false)
  })
})

describe('sanitizeSearchQuery', () => {
  it('should escape regex special characters', () => {
    const result = sanitizeSearchQuery('test.*query')
    expect(result).toContain('\\')
  })

  it('should limit query length', () => {
    const longQuery = 'a'.repeat(150)
    const result = sanitizeSearchQuery(longQuery)
    expect(result.length).toBeLessThanOrEqual(100)
  })

  it('should trim whitespace', () => {
    const result = sanitizeSearchQuery('  test  ')
    expect(result).toBe('test')
  })
})

describe('createSafeDisplayName', () => {
  it('should remove HTML tags', () => {
    const result = createSafeDisplayName('<script>alert("xss")</script>John')
    expect(result).not.toContain('<script>')
    expect(result).toContain('John')
  })

  it('should remove control characters', () => {
    const result = createSafeDisplayName('John\x00Doe')
    expect(result).not.toContain('\x00')
  })

  it('should trim whitespace', () => {
    const result = createSafeDisplayName('  John Doe  ')
    expect(result).toBe('John Doe')
  })

  it('should limit length', () => {
    const longName = 'a'.repeat(150)
    const result = createSafeDisplayName(longName)
    expect(result.length).toBeLessThanOrEqual(100)
  })
})

describe('sanitizeBio', () => {
  it('should sanitize multiline text', () => {
    const result = sanitizeBio('Hello <script>alert("xss")</script> World')
    expect(result).not.toContain('<script>')
  })

  it('should limit length to 500 characters', () => {
    const longBio = 'a'.repeat(600)
    const result = sanitizeBio(longBio)
    expect(result.length).toBeLessThanOrEqual(500)
  })

  it('should handle empty bio', () => {
    const result = sanitizeBio('')
    expect(result).toBe('')
  })
})

describe('sanitizeReflection', () => {
  it('should sanitize multiline text', () => {
    const result = sanitizeReflection('Great experience <script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
  })

  it('should limit length to 5000 characters', () => {
    const longReflection = 'a'.repeat(6000)
    const result = sanitizeReflection(longReflection)
    expect(result.length).toBeLessThanOrEqual(5000)
  })

  it('should handle empty reflection', () => {
    const result = sanitizeReflection('')
    expect(result).toBe('')
  })
})
