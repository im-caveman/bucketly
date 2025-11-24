# Admin Panel Spacing Standard

This document defines the standard spacing pattern for all admin panel components to ensure consistency and prevent layout issues.

## Standard Pattern

### Card Structure (Recommended)
```tsx
<Card>
  <CardHeader className="pb-4 !h-auto min-h-[auto]">
    <CardTitle className="flex items-center gap-2 mb-2">
      {/* Title with icon */}
    </CardTitle>
    <CardDescription className="mt-0 text-sm leading-relaxed">
      {/* Description text */}
    </CardDescription>
  </CardHeader>
  <CardContent className="pt-4">
    {/* Content starts here */}
  </CardContent>
</Card>
```

**Note**: The Card component has been updated to use `min-h-[2.25rem]` instead of fixed `h-9` to prevent description text from being cut off. The `!h-auto min-h-[auto]` override ensures the header grows to fit content.

### Form Field Pattern
```tsx
<div className="space-y-2">
  <Label htmlFor="field-id" className="text-base font-semibold">
    Field Label *
  </Label>
  <Input
    id="field-id"
    className="h-11"
    // ... other props
  />
</div>
```

### Form Container Pattern
```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  {/* Form sections with space-y-6 between major sections */}
  <div className="space-y-6">
    {/* Individual fields with space-y-2 containers */}
  </div>
</form>
```

## Key Rules

1. **CardHeader**: 
   - Always use `pb-4` (padding-bottom)
   - Use `!h-auto min-h-[auto]` to ensure header grows to fit description text
   - Prevents description text from being cut off by fixed height
2. **CardTitle**: 
   - Use `mb-2` to add spacing between title and description
   - Default has `mb-0.5` but `mb-2` provides better spacing for admin panels
3. **CardDescription**: 
   - Use `mt-0 text-sm leading-relaxed` (default is `mt-0`, override if needed)
   - Ensures description is fully visible and readable
4. **CardContent**: 
   - Use `pt-4` for proper spacing between header and content
   - Default is `pt-3`, but `pt-4` provides better visual separation
5. **Form containers**: Use `space-y-6` for main form spacing
6. **Field containers**: Use `space-y-2` for label + input spacing
7. **Section spacing**: Use `space-y-6` between major form sections
8. **Labels**: Use `text-base font-semibold` (no `mb-2 block`, use container spacing instead)

## Examples

### ✅ Correct Pattern
```tsx
<Card>
  <CardHeader className="pb-4 !h-auto min-h-[auto]">
    <CardTitle className="mb-2">Title</CardTitle>
    <CardDescription className="mt-0 text-sm leading-relaxed">
      Description text that won't be cut off
    </CardDescription>
  </CardHeader>
  <CardContent className="pt-4">
    <form className="space-y-6">
      <div className="space-y-2">
        <Label>Field Label</Label>
        <Input />
      </div>
    </form>
  </CardContent>
</Card>
```

### ❌ Incorrect Pattern (Will cause description to be cut off)
```tsx
<Card>
  <CardHeader className="pb-4">
    {/* Missing !h-auto min-h-[auto] - description may be cut off */}
    <CardTitle>Title</CardTitle>
    <CardDescription className="mt-2">
      {/* Description may be cut off due to fixed header height */}
    </CardDescription>
  </CardHeader>
  <CardContent className="pt-0">
    {/* pt-0 removes spacing, use pt-4 instead */}
    <form>
      <div>
        <Label className="mb-2 block">Field Label</Label>
        <Input />
      </div>
    </form>
  </CardContent>
</Card>
```

## Checklist for New Admin Components

- [ ] CardHeader has `pb-4 !h-auto min-h-[auto]` (prevents description cutoff)
- [ ] CardTitle has `mb-2` for spacing from description
- [ ] CardDescription has `mt-0 text-sm leading-relaxed` (fully visible)
- [ ] CardContent has `pt-4` (proper spacing from header)
- [ ] Form uses `space-y-6` for main spacing
- [ ] Each field wrapped in `space-y-2` container
- [ ] Labels use `text-base font-semibold` (no `mb-2 block`)
- [ ] Major sections separated by `space-y-6`
- [ ] Test that description text is fully visible and not cut off

## Component Updates

The base `Card` component has been updated to:
- Use `min-h-[2.25rem]` instead of fixed `h-9` for CardHeader (allows growth)
- Add default `mb-0.5` to CardTitle (can be overridden with `mb-2` for admin panels)
- Add default `mt-0 leading-relaxed` to CardDescription (prevents overlap)
- Add default `pt-3` to CardContent (can be overridden with `pt-4` for admin panels)

These changes ensure descriptions are never cut off by default, but admin panels should still use the explicit classes for consistency.

