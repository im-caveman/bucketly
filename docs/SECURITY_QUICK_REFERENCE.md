# Security Quick Reference

Quick reference guide for developers working with security features in the application.

## Environment Variables

### Setup
```bash
# Copy example file
copy .env.example .env.local

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Rules
- ✅ Use `NEXT_PUBLIC_` for client-safe values
- ❌ Never use `NEXT_PUBLIC_` for secrets
- ✅ Validate on startup (already implemented)

## Input Sanitization

### Text Input
```typescript
import { sanitizeText } from '@/lib/sanitization'

// For short text (usernames, titles)
const safe = sanitizeText(userInput)
```

### Multiline Content
```typescript
import { sanitizeMultilineText } from '@/lib/sanitization'

// For descriptions, reflections, bio
const safe = sanitizeMultilineText(userInput)
```

### URLs
```typescript
import { sanitizeUrl } from '@/lib/sanitization'

const safeUrl = sanitizeUrl(userUrl)
if (!safeUrl) {
  // URL was dangerous, handle error
}
```

### File Uploads
```typescript
import { validateFileUpload } from '@/lib/validation'

const result = validateFileUpload(file)
if (!result.isValid) {
  toast.error(result.error)
  return
}
```

## React Components

### Safe Text Rendering
```typescript
import { useSafeText, useSafeBio } from '@/hooks/use-safe-content'

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

### Form Validation
```typescript
import { validateUsername, validateEmail } from '@/lib/validation'

const usernameResult = validateUsername(username)
if (!usernameResult.isValid) {
  setError(usernameResult.error)
}
```

## Common Patterns

### User-Generated Content
```typescript
// ❌ NEVER do this
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Always do this
<div>{useSafeMultilineText(userContent)}</div>
```

### External Links
```typescript
// ✅ Sanitize URLs
const safeUrl = sanitizeUrl(link.url)
if (safeUrl) {
  <a href={safeUrl} target="_blank" rel="noopener noreferrer">
    {link.title}
  </a>
}
```

### File Upload Form
```typescript
const handleFileUpload = (file: File) => {
  // Validate file
  const validation = validateFileUpload(file)
  if (!validation.isValid) {
    toast.error(validation.error)
    return
  }
  
  // Sanitize filename
  const safeFilename = sanitizeFilename(file.name)
  
  // Upload with safe filename
  await uploadFile(file, safeFilename)
}
```

## Security Headers

Headers are automatically applied via `next.config.ts`. No action needed in components.

### Testing Headers
```bash
# Check headers in production
curl -I https://your-domain.com
```

### Common Issues

**Images not loading?**
```typescript
// Add domain to next.config.ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-cdn.com',
    },
  ],
}
```

**API calls blocked?**
```typescript
// Add to CSP in next.config.ts
"connect-src 'self' https://your-api.com"
```

## Validation Functions

| Function | Use For | Max Length |
|----------|---------|------------|
| `validateEmail()` | Email addresses | - |
| `validatePassword()` | Passwords | Min 8 chars |
| `validateUsername()` | Usernames | 3-30 chars |
| `validateBio()` | Bio text | 500 chars |
| `validateListName()` | List names | 3-100 chars |
| `validateItemTitle()` | Item titles | 3-200 chars |
| `validateReflection()` | Reflections | 10-5000 chars |
| `validatePoints()` | Point values | 1-1000 |
| `validateFileUpload()` | File uploads | 10MB |
| `validateAvatarUpload()` | Avatar uploads | 5MB |

## Sanitization Functions

| Function | Use For | What It Does |
|----------|---------|--------------|
| `sanitizeText()` | Short text | Escapes HTML |
| `sanitizeMultilineText()` | Long text | Removes scripts, escapes HTML |
| `sanitizeUrl()` | URLs | Blocks dangerous protocols |
| `sanitizeFilename()` | Filenames | Prevents directory traversal |
| `sanitizeMetadata()` | JSON data | Recursive sanitization |
| `stripHtml()` | Plain text | Removes all HTML |

## React Hooks

| Hook | Use For |
|------|---------|
| `useSafeText()` | Short text fields |
| `useSafeMultilineText()` | Long text content |
| `useSafeUrl()` | URLs |
| `useSafeBio()` | User bios |
| `useSafeReflection()` | Reflections |
| `useSafeDisplayName()` | Display names |

## Checklist for New Features

- [ ] Validate all user inputs
- [ ] Sanitize before storing in database
- [ ] Sanitize before displaying in UI
- [ ] Use React hooks for safe rendering
- [ ] Validate file uploads
- [ ] Test with XSS payloads
- [ ] Check security headers still work

## Testing XSS

Test your forms with these payloads:

```javascript
const xssTests = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<iframe src="javascript:alert(\'XSS\')">',
]
```

All should be safely escaped or blocked.

## Quick Commands

```bash
# Check for secrets in code
grep -r "password\|secret\|api_key" --include="*.ts" .

# Check dependencies
npm audit

# Test security headers
curl -I https://your-domain.com

# Check environment variables
cat .env.local
```

## Need Help?

- 📖 Full docs: `docs/INPUT_SANITIZATION.md`
- 📖 Headers: `docs/SECURITY_HEADERS.md`
- 📖 Environment: `docs/ENVIRONMENT_VARIABLES.md`
- ✅ Checklist: `docs/SECURITY_CHECKLIST.md`

## Report Security Issues

🚨 **DO NOT** create public GitHub issues for security vulnerabilities

✅ Email: security@yourcompany.com
