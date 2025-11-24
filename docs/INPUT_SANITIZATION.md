# Input Sanitization Guide

## Overview

This document describes the input sanitization and validation strategies used in the application to prevent XSS (Cross-Site Scripting) attacks and other security vulnerabilities.

## Security Principles

### Defense in Depth

We implement multiple layers of security:

1. **Input Validation**: Validate all user input before processing
2. **Input Sanitization**: Remove or escape dangerous content
3. **Output Encoding**: Escape content when rendering in the UI
4. **Content Security Policy**: Browser-level protection (configured in headers)
5. **Row Level Security**: Database-level access control

### Trust Boundaries

- **Never trust user input**: All user-provided data is potentially malicious
- **Sanitize at input**: Clean data as soon as it enters the system
- **Validate at boundaries**: Check data at every system boundary
- **Escape at output**: Encode data when rendering in the UI

## Sanitization Functions

### Text Sanitization

#### `sanitizeText(text: string)`

Basic text sanitization for short strings (usernames, titles, etc.)

```typescript
import { sanitizeText } from '@/lib/sanitization'

const username = sanitizeText(userInput)
```

**What it does:**
- Escapes HTML special characters (`<`, `>`, `"`, `'`, `/`)
- Prevents basic XSS attacks

**Use for:**
- Usernames
- List names
- Item titles
- Short text fields

#### `sanitizeMultilineText(text: string)`

Advanced sanitization for longer content with line breaks

```typescript
import { sanitizeMultilineText } from '@/lib/sanitization'

const description = sanitizeMultilineText(userInput)
```

**What it does:**
- Removes `<script>`, `<style>`, and `<iframe>` tags
- Removes event handlers (`onclick`, `onerror`, etc.)
- Blocks `javascript:` and `data:` protocols
- Escapes HTML special characters
- Preserves line breaks

**Use for:**
- Descriptions
- Reflections
- Bio text
- Comments
- Any multiline user content

### URL Sanitization

#### `sanitizeUrl(url: string)`

Validates and sanitizes URLs to prevent XSS

```typescript
import { sanitizeUrl } from '@/lib/sanitization'

const safeUrl = sanitizeUrl(userProvidedUrl)
if (safeUrl) {
  // Safe to use
}
```

**What it does:**
- Blocks `javascript:`, `data:`, `vbscript:`, and `file:` protocols
- Only allows `http:`, `https:`, `mailto:`, and relative URLs
- Returns empty string for dangerous URLs

**Use for:**
- External links
- Image URLs (with additional domain validation)
- Any user-provided URLs

### File Upload Validation

#### `validateFileUpload(file: File)`

Validates file uploads for security

```typescript
import { validateFileUpload } from '@/lib/validation'

const result = validateFileUpload(file)
if (!result.isValid) {
  console.error(result.error)
}
```

**What it does:**
- Validates file size (max 10MB for photos)
- Validates MIME type (only images)
- Checks file extension matches MIME type
- Blocks suspicious file extensions (`.php`, `.exe`, `.js`, etc.)

**Use for:**
- Memory photo uploads
- Avatar uploads
- Any file upload functionality

#### `validateAvatarUpload(file: File)`

Specialized validation for avatar uploads

```typescript
import { validateAvatarUpload } from '@/lib/validation'

const result = validateAvatarUpload(file)
```

**What it does:**
- Validates file size (max 5MB)
- Only allows JPEG, PNG, and WebP
- Stricter validation than general file uploads

### Filename Sanitization

#### `sanitizeFilename(filename: string)`

Sanitizes filenames to prevent directory traversal

```typescript
import { sanitizeFilename } from '@/lib/sanitization'

const safeFilename = sanitizeFilename(userFilename)
```

**What it does:**
- Removes directory traversal attempts (`../`)
- Removes path separators (`/`, `\`)
- Removes null bytes and control characters
- Limits to alphanumeric, dash, underscore, and dot
- Prevents hidden files (starting with `.`)
- Limits length to 255 characters

### Metadata Sanitization

#### `sanitizeMetadata(metadata: unknown)`

Sanitizes JSON metadata objects

```typescript
import { sanitizeMetadata } from '@/lib/sanitization'

const safeMetadata = sanitizeMetadata(userMetadata)
```

**What it does:**
- Recursively sanitizes object keys and values
- Escapes string values
- Preserves numbers and booleans
- Handles nested objects and arrays

## React Hooks for Safe Content

### Using Safe Content Hooks

We provide React hooks that automatically sanitize content:

```typescript
import { 
  useSafeText, 
  useSafeMultilineText,
  useSafeBio,
  useSafeReflection 
} from '@/hooks/use-safe-content'

function UserProfile({ user }) {
  const safeUsername = useSafeText(user.username)
  const safeBio = useSafeBio(user.bio)
  
  return (
    <div>
      <h1>{safeUsername}</h1>
      <p>{safeBio}</p>
    </div>
  )
}
```

**Available hooks:**
- `useSafeText(text)` - Basic text sanitization
- `useSafeMultilineText(text)` - Multiline content
- `useSafeUrl(url)` - URL validation
- `useSafeBio(bio)` - Bio text
- `useSafeReflection(reflection)` - Reflection text
- `useSafeDisplayName(name)` - Display names
- `useSafeLines(text)` - Split into safe lines

## Validation Functions

### Form Validation

All form inputs should be validated before submission:

```typescript
import { 
  validateEmail,
  validatePassword,
  validateUsername,
  validateListName,
  validateItemTitle,
  validateReflection
} from '@/lib/validation'

// Validate email
const emailResult = validateEmail(email)
if (!emailResult.isValid) {
  console.error(emailResult.error)
}

// Validate password
const passwordResult = validatePassword(password)
if (!passwordResult.isValid) {
  console.error(passwordResult.error)
}
```

### Combined Validation and Sanitization

```typescript
import { validateAndSanitize, validateUsername } from '@/lib/validation'

const result = validateAndSanitize(userInput, validateUsername)
if (result.isValid) {
  // Use result.value (sanitized)
} else {
  // Show result.error
}
```

## Best Practices

### 1. Always Sanitize User Input

```typescript
// ❌ BAD - Direct use of user input
<div>{user.bio}</div>

// ✅ GOOD - Sanitized user input
<div>{useSafeBio(user.bio)}</div>
```

### 2. Validate Before Sanitizing

```typescript
// ✅ GOOD - Validate first, then sanitize
const validation = validateUsername(input)
if (!validation.isValid) {
  return { error: validation.error }
}
const sanitized = sanitizeText(input)
```

### 3. Use Specific Validators

```typescript
// ❌ BAD - Generic validation
if (input.length > 0) { ... }

// ✅ GOOD - Specific validation
const result = validateItemTitle(input)
if (result.isValid) { ... }
```

### 4. Sanitize at Multiple Layers

```typescript
// ✅ GOOD - Sanitize when storing AND when displaying
const sanitizedInput = sanitizeText(userInput)
await supabase.from('profiles').update({ username: sanitizedInput })

// Later, when displaying
const safeUsername = useSafeText(profile.username)
```

### 5. Never Use dangerouslySetInnerHTML

```typescript
// ❌ NEVER DO THIS
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ GOOD - Use sanitized text
<div>{useSafeMultilineText(userContent)}</div>
```

### 6. Validate File Uploads

```typescript
// ✅ GOOD - Validate before uploading
const validation = validateFileUpload(file)
if (!validation.isValid) {
  toast.error(validation.error)
  return
}

const sanitizedFilename = sanitizeFilename(file.name)
// Upload with sanitized filename
```

### 7. Use Type-Safe Validation

```typescript
// ✅ GOOD - Type-safe validation
interface FormData {
  username: string
  bio: string
  email: string
}

function validateFormData(data: FormData) {
  return validateForm({
    username: validateUsername(data.username),
    bio: validateBio(data.bio),
    email: validateEmail(data.email)
  })
}
```

## Common XSS Attack Vectors

### 1. Script Injection

```html
<!-- Attack -->
<script>alert('XSS')</script>

<!-- Sanitized -->
&lt;script&gt;alert('XSS')&lt;/script&gt;
```

### 2. Event Handler Injection

```html
<!-- Attack -->
<img src="x" onerror="alert('XSS')">

<!-- Sanitized -->
&lt;img src="x" onerror="alert('XSS')"&gt;
```

### 3. JavaScript Protocol

```html
<!-- Attack -->
<a href="javascript:alert('XSS')">Click</a>

<!-- Sanitized -->
<a href="">Click</a>
```

### 4. Data Protocol

```html
<!-- Attack -->
<img src="data:text/html,<script>alert('XSS')</script>">

<!-- Sanitized -->
<img src="">
```

## Testing Sanitization

### Manual Testing

Test with these common XSS payloads:

```javascript
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')">',
  '<svg onload=alert("XSS")>',
  '"><script>alert("XSS")</script>',
  "' OR '1'='1",
  '../../../etc/passwd'
]

xssPayloads.forEach(payload => {
  const sanitized = sanitizeText(payload)
  console.log('Original:', payload)
  console.log('Sanitized:', sanitized)
  console.log('---')
})
```

### Automated Testing

```typescript
import { sanitizeText, sanitizeUrl } from '@/lib/sanitization'

describe('Sanitization', () => {
  it('should escape HTML special characters', () => {
    const input = '<script>alert("XSS")</script>'
    const output = sanitizeText(input)
    expect(output).not.toContain('<script>')
    expect(output).toContain('&lt;script&gt;')
  })
  
  it('should block javascript: protocol', () => {
    const input = 'javascript:alert("XSS")'
    const output = sanitizeUrl(input)
    expect(output).toBe('')
  })
})
```

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email security@yourcompany.com with details
3. Include steps to reproduce
4. Allow time for a fix before public disclosure

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)
- [Content Security Policy Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [React Security Best Practices](https://react.dev/learn/security)
