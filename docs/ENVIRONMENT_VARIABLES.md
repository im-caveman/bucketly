# Environment Variables Documentation

## Overview

This document describes all environment variables used in the application, their purpose, security considerations, and setup instructions.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   copy .env.example .env.local
   ```

2. Fill in your Supabase credentials from the [Supabase Dashboard](https://app.supabase.com)

3. Never commit `.env.local` to version control (it's already in `.gitignore`)

## Environment Variables Reference

### Public Variables (Client-Side)

These variables use the `NEXT_PUBLIC_` prefix and are embedded into the client-side JavaScript bundle. They are visible to anyone who inspects your website.

#### `NEXT_PUBLIC_SUPABASE_URL`

- **Required**: Yes
- **Type**: String (URL)
- **Description**: Your Supabase project API URL
- **Example**: `https://abcdefghijklmnop.supabase.co`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project URL
- **Security**: Public - Safe to expose to the client

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- **Required**: Yes
- **Type**: String (JWT)
- **Description**: Your Supabase anonymous/public API key
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → `anon` `public`
- **Security**: Public - Safe to expose to the client (has limited permissions enforced by RLS)

### Private Variables (Server-Side Only)

These variables do NOT use the `NEXT_PUBLIC_` prefix and are only available in server-side code (API routes, server components, server actions). They are never sent to the client.

#### `SUPABASE_SERVICE_ROLE_KEY` (Optional)

- **Required**: No (only needed for server-side admin operations)
- **Type**: String (JWT)
- **Description**: Your Supabase service role key with full database access
- **Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → `service_role` `secret`
- **Security**: PRIVATE - NEVER expose to the client (bypasses RLS policies)
- **Usage**: Only use in server-side code for administrative operations

#### `NODE_ENV` (Optional)

- **Required**: No (automatically set by Next.js)
- **Type**: String
- **Values**: `development`, `production`, `test`
- **Description**: The current environment mode
- **Security**: Public - Safe to expose

## Security Best Practices

### 1. Key Prefix Rules

- ✅ **DO** use `NEXT_PUBLIC_` prefix for values safe to expose to the browser
- ❌ **DON'T** use `NEXT_PUBLIC_` prefix for sensitive credentials
- ✅ **DO** keep service role keys and secrets without `NEXT_PUBLIC_` prefix

### 2. Version Control

- ✅ **DO** commit `.env.example` with placeholder values
- ❌ **DON'T** commit `.env.local` or any file with actual credentials
- ✅ **DO** verify `.env.local` is in `.gitignore`

### 3. Key Management

- ✅ **DO** rotate keys regularly (every 90 days recommended)
- ✅ **DO** use different keys for development, staging, and production
- ✅ **DO** revoke and regenerate keys if they may have been compromised
- ❌ **DON'T** share keys via email, Slack, or other insecure channels

### 4. Production Deployment

- ✅ **DO** store production secrets in your hosting platform's environment variables:
  - **Vercel**: Project Settings → Environment Variables
  - **Netlify**: Site Settings → Environment Variables
  - **AWS**: Systems Manager Parameter Store or Secrets Manager
- ❌ **DON'T** deploy `.env.local` files to production servers
- ✅ **DO** use different credentials for each environment

### 5. Access Control

- ✅ **DO** limit who has access to production credentials
- ✅ **DO** use role-based access control in your team
- ✅ **DO** audit access logs regularly
- ❌ **DON'T** share service role keys with frontend developers

## Supabase Security Model

### Anonymous Key (Public)

The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is designed to be public and safe to expose because:

1. **Row Level Security (RLS)**: All database access is controlled by RLS policies
2. **Limited Permissions**: The anon key only has permissions granted by RLS policies
3. **User Context**: Each request is scoped to the authenticated user's context
4. **API Gateway**: Supabase validates all requests through its API gateway

### Service Role Key (Private)

The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS policies and should NEVER be exposed:

1. **Full Access**: Has complete access to all data regardless of RLS policies
2. **Admin Operations**: Only use for administrative tasks on the server
3. **Server-Side Only**: Must only be used in API routes or server components
4. **High Risk**: If compromised, attackers have full database access

## Troubleshooting

### Missing Environment Variables

If you see errors about missing environment variables:

1. Verify `.env.local` exists in the project root
2. Check that variable names match exactly (case-sensitive)
3. Restart the development server after adding new variables
4. For production, verify variables are set in your hosting platform

### Variables Not Loading

If environment variables aren't being recognized:

1. **Client-side variables**: Must use `NEXT_PUBLIC_` prefix
2. **Server-side variables**: Access via `process.env.VARIABLE_NAME`
3. **Restart required**: Restart dev server after changing `.env.local`
4. **Build time**: Some variables are embedded at build time, rebuild if needed

### Invalid Credentials

If you get authentication errors:

1. Verify the Supabase URL format is correct (include `https://`)
2. Check that you copied the full anon key (they're very long)
3. Ensure you're using keys from the correct Supabase project
4. Verify your Supabase project is active and not paused

## Environment-Specific Configuration

### Development

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev-anon-key
NODE_ENV=development
```

### Staging

```bash
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
NODE_ENV=production
```

### Production

```bash
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
NODE_ENV=production
```

## Additional Resources

- [Next.js Environment Variables Documentation](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

## Support

If you need help with environment configuration:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [Next.js Documentation](https://nextjs.org/docs)
3. Contact your team lead or DevOps engineer
