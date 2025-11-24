export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: 'Email is required'
    }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password || password.trim() === '') {
    return {
      isValid: false,
      error: 'Password is required'
    }
  }
  
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long'
    }
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter'
    }
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter'
    }
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one number'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates username
 */
export function validateUsername(username: string): ValidationResult {
  if (!username || username.trim() === '') {
    return {
      isValid: false,
      error: 'Username is required'
    }
  }
  
  if (username.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long'
    }
  }
  
  if (username.length > 30) {
    return {
      isValid: false,
      error: 'Username must be no more than 30 characters long'
    }
  }
  
  // Check for valid characters (alphanumeric, underscore, hyphen)
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, underscores, and hyphens'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates bio text
 */
export function validateBio(bio: string): ValidationResult {
  if (bio && bio.length > 500) {
    return {
      isValid: false,
      error: 'Bio must be no more than 500 characters long'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates bucket list name
 */
export function validateListName(name: string): ValidationResult {
  if (!name || name.trim() === '') {
    return {
      isValid: false,
      error: 'List name is required'
    }
  }
  
  if (name.length < 3) {
    return {
      isValid: false,
      error: 'List name must be at least 3 characters long'
    }
  }
  
  if (name.length > 100) {
    return {
      isValid: false,
      error: 'List name must be no more than 100 characters long'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates bucket list category
 */
export function validateCategory(category: string): ValidationResult {
  const validCategories = [
    'adventures',
    'places',
    'cuisines',
    'books',
    'songs',
    'monuments',
    'acts-of-service',
    'miscellaneous'
  ]
  
  if (!category || category.trim() === '') {
    return {
      isValid: false,
      error: 'Category is required'
    }
  }
  
  if (!validCategories.includes(category)) {
    return {
      isValid: false,
      error: 'Please select a valid category'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates bucket item title
 */
export function validateItemTitle(title: string): ValidationResult {
  if (!title || title.trim() === '') {
    return {
      isValid: false,
      error: 'Item title is required'
    }
  }
  
  if (title.length < 3) {
    return {
      isValid: false,
      error: 'Item title must be at least 3 characters long'
    }
  }
  
  if (title.length > 200) {
    return {
      isValid: false,
      error: 'Item title must be no more than 200 characters long'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates points value
 */
export function validatePoints(points: number): ValidationResult {
  if (points === null || points === undefined) {
    return {
      isValid: false,
      error: 'Points value is required'
    }
  }
  
  if (points < 1) {
    return {
      isValid: false,
      error: 'Points must be at least 1'
    }
  }
  
  if (points > 1000) {
    return {
      isValid: false,
      error: 'Points must be no more than 1000'
    }
  }
  
  if (!Number.isInteger(points)) {
    return {
      isValid: false,
      error: 'Points must be a whole number'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates difficulty level
 */
export function validateDifficulty(difficulty: string): ValidationResult {
  const validDifficulties = ['easy', 'medium', 'hard']
  
  if (difficulty && !validDifficulties.includes(difficulty)) {
    return {
      isValid: false,
      error: 'Please select a valid difficulty level'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates memory reflection text
 */
export function validateReflection(reflection: string): ValidationResult {
  if (!reflection || reflection.trim() === '') {
    return {
      isValid: false,
      error: 'Reflection is required'
    }
  }
  
  if (reflection.length < 10) {
    return {
      isValid: false,
      error: 'Reflection must be at least 10 characters long'
    }
  }
  
  if (reflection.length > 5000) {
    return {
      isValid: false,
      error: 'Reflection must be no more than 5000 characters long'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates file size
 */
export function validateFileSize(file: File, maxSizeMB: number): ValidationResult {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    }
  }
  
  return { isValid: true }
}

/**
 * Validates image file type
 */
export function validateImageType(file: File): ValidationResult {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File must be an image (JPEG, PNG, GIF, or WebP)'
    }
  }
  
  return { isValid: true }
}

/**
 * Validates multiple fields and returns all errors
 */
export function validateForm(
  validations: Record<string, ValidationResult>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  let isValid = true
  
  for (const [field, result] of Object.entries(validations)) {
    if (!result.isValid && result.error) {
      errors[field] = result.error
      isValid = false
    }
  }
  
  return { isValid, errors }
}

/**
 * Sanitizes user input to prevent XSS attacks
 * Escapes HTML special characters that could be used for XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitizes HTML content more aggressively
 * Removes all HTML tags and scripts
 */
export function sanitizeHtml(input: string): string {
  if (!input) return ''
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove all HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  // Escape remaining special characters
  return sanitizeInput(sanitized)
}

/**
 * Sanitizes user-generated content for display
 * Preserves line breaks but removes dangerous content
 */
export function sanitizeUserContent(input: string): string {
  if (!input) return ''
  
  // Remove script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '')
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')
  
  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, '')
  
  // Escape HTML special characters
  return sanitizeInput(sanitized)
}

/**
 * Sanitizes URL input to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''
  
  const trimmedUrl = url.trim()
  
  // Block dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file):/i
  if (dangerousProtocols.test(trimmedUrl)) {
    return ''
  }
  
  // Only allow http, https, and relative URLs
  if (trimmedUrl.startsWith('http://') || 
      trimmedUrl.startsWith('https://') || 
      trimmedUrl.startsWith('/') ||
      trimmedUrl.startsWith('./') ||
      trimmedUrl.startsWith('../')) {
    return trimmedUrl
  }
  
  // If no protocol, assume relative URL
  if (!trimmedUrl.includes(':')) {
    return trimmedUrl
  }
  
  // Block anything else
  return ''
}

/**
 * Validates and sanitizes text input
 */
export function validateAndSanitize(
  input: string,
  validator: (input: string) => ValidationResult
): { isValid: boolean; value: string; error?: string } {
  const validation = validator(input)
  
  if (!validation.isValid) {
    return {
      isValid: false,
      value: '',
      error: validation.error
    }
  }
  
  return {
    isValid: true,
    value: sanitizeInput(input)
  }
}

/**
 * Validates file upload for security
 */
export function validateFileUpload(file: File): ValidationResult {
  // Check file size (10MB for memory photos)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB'
    }
  }
  
  // Validate image type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File must be an image (JPEG, PNG, GIF, or WebP)'
    }
  }
  
  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase()
  const mimeToExtension: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp']
  }
  
  const validExtensions = mimeToExtension[file.type] || []
  if (extension && !validExtensions.includes(extension)) {
    return {
      isValid: false,
      error: 'File extension does not match file type'
    }
  }
  
  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.php$/i,
    /\.exe$/i,
    /\.sh$/i,
    /\.bat$/i,
    /\.cmd$/i,
    /\.com$/i,
    /\.pif$/i,
    /\.scr$/i,
    /\.vbs$/i,
    /\.js$/i,
    /\.jar$/i
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.name)) {
      return {
        isValid: false,
        error: 'File name contains suspicious extension'
      }
    }
  }
  
  return { isValid: true }
}

/**
 * Validates avatar file upload
 */
export function validateAvatarUpload(file: File): ValidationResult {
  // Check file size (5MB for avatars)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'Avatar file size must be less than 5MB'
    }
  }
  
  // Validate image type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Avatar must be a JPEG, PNG, or WebP image'
    }
  }
  
  return { isValid: true }
}
