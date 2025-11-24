# Security Headers Documentation

## Overview

This document describes the security headers configured in the application to protect against common web vulnerabilities including XSS, clickjacking, MIME sniffing, and other attacks.

## Configured Security Headers

### 1. X-XSS-Protection

```
X-XSS-Protection: 1; mode=block
```

**Purpose**: Enables the browser's built-in XSS filter

**What it does**:
- Detects reflected XSS attacks
- Blocks page rendering if an attack is detected
- Legacy header but still provides defense-in-depth

**Browser Support**: Most modern browsers (deprecated in favor of CSP)

### 2. X-Frame-Options

```
X-Frame-Options: SAMEORIGIN
```

**Purpose**: Prevents clickjacking attacks

**What it does**:
- Prevents the page from being embedded in iframes on other domains
- Allows embedding only on the same origin
- Protects against UI redressing attacks

**Options**:
- `DENY` - Never allow framing
- `SAMEORIGIN` - Allow framing only from same origin (our choice)
- `ALLOW-FROM uri` - Allow framing from specific URI (deprecated)

**Why SAMEORIGIN**: Allows legitimate use cases while preventing malicious framing

### 3. X-Content-Type-Options

```
X-Content-Type-Options: nosniff
```

**Purpose**: Prevents MIME type sniffing

**What it does**:
- Forces browsers to respect the declared Content-Type
- Prevents browsers from interpreting files as a different MIME type
- Blocks execution of scripts disguised as other file types

**Example Attack Prevented**:
- Attacker uploads image file containing JavaScript
- Without this header, browser might execute it as JavaScript
- With this header, browser treats it strictly as an image

### 4. Referrer-Policy

```
Referrer-Policy: strict-origin-when-cross-origin
```

**Purpose**: Controls how much referrer information is sent with requests

**What it does**:
- Sends full URL for same-origin requests
- Sends only origin (no path) for cross-origin requests
- Sends nothing when downgrading from HTTPS to HTTP

**Privacy Benefits**:
- Prevents leaking sensitive URL parameters to third parties
- Protects user privacy while maintaining analytics functionality

**Other Options**:
- `no-referrer` - Never send referrer (most private)
- `origin` - Always send only origin
- `strict-origin-when-cross-origin` - Our choice (balanced)

### 5. Permissions-Policy

```
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

**Purpose**: Controls which browser features can be used

**What it does**:
- Disables camera access
- Disables microphone access
- Disables geolocation access

**Why**: Our application doesn't need these features, so we disable them to reduce attack surface

**Customization**: If you need these features in the future, update the policy:
```
camera=(self), microphone=(self), geolocation=(self)
```

### 6. Content-Security-Policy (CSP)

```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
  object-src 'none';
  upgrade-insecure-requests
```

**Purpose**: The most powerful security header - controls what resources can be loaded

#### CSP Directives Explained

**default-src 'self'**
- Default policy for all resource types
- Only allow resources from same origin

**script-src 'self' 'unsafe-eval' 'unsafe-inline'**
- Allow scripts from same origin
- `unsafe-eval` - Required by Next.js for development
- `unsafe-inline` - Required by Next.js for inline scripts
- ⚠️ Note: These reduce CSP effectiveness but are necessary for Next.js

**style-src 'self' 'unsafe-inline'**
- Allow styles from same origin
- `unsafe-inline` - Required by Tailwind CSS and styled-components

**img-src 'self' data: https: blob:**
- Allow images from same origin
- `data:` - Allow data URLs (base64 images)
- `https:` - Allow images from any HTTPS source
- `blob:` - Allow blob URLs (for uploaded images)

**font-src 'self' data:**
- Allow fonts from same origin
- `data:` - Allow data URLs for fonts

**connect-src 'self' https://*.supabase.co wss://*.supabase.co**
- Allow API calls to same origin
- Allow connections to Supabase (HTTPS and WebSocket)
- Blocks connections to other domains

**frame-ancestors 'self'**
- Modern replacement for X-Frame-Options
- Only allow framing from same origin

**base-uri 'self'**
- Restricts URLs that can be used in `<base>` element
- Prevents base tag injection attacks

**form-action 'self'**
- Restricts where forms can be submitted
- Prevents form hijacking

**object-src 'none'**
- Blocks `<object>`, `<embed>`, and `<applet>` elements
- Prevents Flash and other plugin-based attacks

**upgrade-insecure-requests**
- Automatically upgrades HTTP requests to HTTPS
- Only active when page is served over HTTPS

### 7. Strict-Transport-Security (HSTS)

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Purpose**: Forces HTTPS connections

**What it does**:
- Tells browsers to only connect via HTTPS
- Prevents protocol downgrade attacks
- Prevents cookie hijacking

**Configuration**:
- `max-age=63072000` - 2 years in seconds
- `includeSubDomains` - Apply to all subdomains
- `preload` - Eligible for browser preload list

**Important**: Only enabled in production (requires HTTPS)

## Testing Security Headers

### Using Browser DevTools

1. Open DevTools (F12)
2. Go to Network tab
3. Reload the page
4. Click on the document request
5. Check the Response Headers section

### Using Online Tools

**Security Headers Scanner**
- https://securityheaders.com
- Enter your production URL
- Get a grade and recommendations

**Mozilla Observatory**
- https://observatory.mozilla.org
- Comprehensive security analysis
- Provides detailed recommendations

### Using curl

```bash
curl -I https://your-domain.com
```

Look for the security headers in the response.

## CSP Violation Reporting

### Setting Up CSP Reporting

To monitor CSP violations in production, add a report-uri:

```typescript
// In next.config.ts
{
  key: 'Content-Security-Policy',
  value: [
    // ... other directives
    "report-uri /api/csp-report",
    "report-to csp-endpoint"
  ].join('; ')
}
```

### Creating Report Endpoint

```typescript
// app/api/csp-report/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const report = await request.json()
    
    // Log CSP violation
    console.error('CSP Violation:', JSON.stringify(report, null, 2))
    
    // In production, send to monitoring service
    // await sendToMonitoring(report)
    
    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid report' }, { status: 400 })
  }
}
```

## Customizing Security Headers

### For Development

If security headers cause issues in development:

```typescript
// next.config.ts
const isDevelopment = process.env.NODE_ENV === 'development'

async headers() {
  if (isDevelopment) {
    // Relaxed headers for development
    return []
  }
  
  // Strict headers for production
  return [/* ... */]
}
```

### For Specific Routes

Apply different headers to different routes:

```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        // API-specific headers
      ]
    },
    {
      source: '/:path*',
      headers: [
        // General headers
      ]
    }
  ]
}
```

### Adding New Allowed Domains

To allow resources from additional domains:

```typescript
// For images
"img-src 'self' data: https: blob: https://trusted-cdn.com",

// For API calls
"connect-src 'self' https://*.supabase.co https://api.trusted-service.com",

// For scripts
"script-src 'self' 'unsafe-eval' 'unsafe-inline' https://trusted-analytics.com",
```

## Common Issues and Solutions

### Issue: Inline Styles Not Working

**Symptom**: Styles not applying, CSP errors in console

**Solution**: Add `'unsafe-inline'` to `style-src` (already configured)

```typescript
"style-src 'self' 'unsafe-inline'"
```

### Issue: Images Not Loading

**Symptom**: Images from external sources blocked

**Solution**: Add the domain to `img-src`

```typescript
"img-src 'self' data: https: blob: https://your-cdn.com"
```

### Issue: API Calls Blocked

**Symptom**: Fetch/XHR requests failing with CSP errors

**Solution**: Add the API domain to `connect-src`

```typescript
"connect-src 'self' https://*.supabase.co https://your-api.com"
```

### Issue: WebSocket Connection Blocked

**Symptom**: Real-time features not working

**Solution**: Add WebSocket protocol to `connect-src`

```typescript
"connect-src 'self' https://*.supabase.co wss://*.supabase.co"
```

### Issue: HSTS Not Working Locally

**Symptom**: HSTS header not appearing in development

**Solution**: This is expected - HSTS is only enabled in production

```typescript
...(process.env.NODE_ENV === 'production' ? [{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
}] : [])
```

## Security Best Practices

### 1. Start Strict, Relax as Needed

- Begin with the strictest possible CSP
- Relax only when necessary
- Document why each relaxation is needed

### 2. Monitor CSP Violations

- Set up CSP reporting in production
- Review violations regularly
- Tighten policy based on findings

### 3. Test in Multiple Browsers

- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

### 4. Use HTTPS Everywhere

- Enable HSTS in production
- Use HTTPS for all external resources
- Configure `upgrade-insecure-requests`

### 5. Regular Security Audits

- Run security header scanners monthly
- Update headers based on new threats
- Keep up with security best practices

### 6. Document Changes

- Document why headers are configured a certain way
- Note any relaxations and their justification
- Keep this documentation updated

## HTTPS Enforcement

### Development

Development typically uses HTTP (localhost):
- HSTS is disabled
- `upgrade-insecure-requests` has no effect
- Test HTTPS features in staging

### Production

Production must use HTTPS:
- Configure SSL certificate in hosting platform
- Enable HSTS
- All resources loaded over HTTPS
- Automatic HTTP to HTTPS redirect

### Hosting Platform Configuration

**Vercel**
- HTTPS automatic for all deployments
- Custom domains get free SSL certificates
- No additional configuration needed

**Netlify**
- HTTPS automatic for all sites
- Free SSL certificates via Let's Encrypt
- Force HTTPS in site settings

**Custom Server**
- Obtain SSL certificate (Let's Encrypt recommended)
- Configure web server (Nginx, Apache)
- Set up automatic renewal

## Additional Resources

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Content Security Policy Reference](https://content-security-policy.com/)
- [Security Headers Quick Reference](https://securityheaders.com/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)

## Compliance

These security headers help meet compliance requirements for:

- **OWASP Top 10**: Addresses several OWASP vulnerabilities
- **PCI DSS**: Helps meet security requirements
- **GDPR**: Privacy-enhancing headers (Referrer-Policy)
- **SOC 2**: Security controls documentation

## Support

For security-related questions or to report vulnerabilities:

1. Review this documentation
2. Check the [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
3. Contact your security team
4. For vulnerabilities, email security@yourcompany.com (do not create public issues)
