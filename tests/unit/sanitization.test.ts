import { describe, it, expect } from 'vitest'
import { safeJsonLdStringify } from '@/lib/sanitization'

describe('safeJsonLdStringify', () => {
    it('should correctly stringify a simple object', () => {
        const input = { key: 'value', number: 123 }
        const output = safeJsonLdStringify(input)
        expect(output).toBe('{"key":"value","number":123}')
    })

    it('should escape < script > tags to prevent XSS', () => {
        const input = {
            key: '<script>alert("xss")</script>'
        }
        const output = safeJsonLdStringify(input)

        // < should be replaced by \u003c
        expect(output).not.toContain('<script>')
        expect(output).not.toContain('</script>')
        expect(output).toContain('\\u003cscript>')
        expect(output).toContain('\\u003c/script>')
    })

    it('should handle nested objects with potential XSS', () => {
        const input = {
            nested: {
                dangerous: '</script><script>alert(1)</script>'
            }
        }
        const output = safeJsonLdStringify(input)

        expect(output).not.toContain('</script>')
        expect(output).toContain('\\u003c/script>')
    })

    it('should handle arrays with potential XSS', () => {
        const input = ['<script>', '</script>']
        const output = safeJsonLdStringify(input)

        expect(output).toBe('["\\u003cscript>","\\u003c/script>"]')
    })
})
