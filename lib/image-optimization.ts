import imageCompression from 'browser-image-compression'

/**
 * Compress an image file before upload
 * @param file - The image file to compress
 * @param maxSizeMB - Maximum file size in MB (default: 1MB)
 * @param maxWidthOrHeight - Maximum width or height in pixels (default: 1920)
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  maxSizeMB: number = 1,
  maxWidthOrHeight: number = 1920
): Promise<File> {
  const options = {
    maxSizeMB,
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type,
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Create a thumbnail from an image file
 * @param file - The image file to create thumbnail from
 * @param maxWidthOrHeight - Maximum width or height for thumbnail (default: 300)
 * @returns Thumbnail image file
 */
export async function createThumbnail(
  file: File,
  maxWidthOrHeight: number = 300
): Promise<File> {
  const options = {
    maxSizeMB: 0.1, // 100KB max for thumbnails
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: file.type,
  }

  try {
    const thumbnail = await imageCompression(file, options)
    // Rename to indicate it's a thumbnail
    const thumbnailFile = new File(
      [thumbnail],
      `thumb_${file.name}`,
      { type: thumbnail.type }
    )
    return thumbnailFile
  } catch (error) {
    console.error('Error creating thumbnail:', error)
    throw new Error('Failed to create thumbnail')
  }
}

/**
 * Validate image file type and size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum allowed file size in MB
 * @returns true if valid, throws error otherwise
 */
export function validateImageFile(file: File, maxSizeMB: number = 10): boolean {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.')
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`)
  }

  return true
}

/**
 * Get optimized image URL with Supabase transformations
 * @param url - The original image URL
 * @param width - Desired width
 * @param height - Desired height
 * @param quality - Image quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  url: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!url) return url

  // Check if it's a Supabase storage URL
  if (!url.includes('supabase')) return url

  const params = new URLSearchParams()
  
  if (width) params.append('width', width.toString())
  if (height) params.append('height', height.toString())
  params.append('quality', quality.toString())

  return `${url}?${params.toString()}`
}

/**
 * Preload an image to improve perceived performance
 * @param src - Image source URL
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = src
  })
}

/**
 * Generate a blurhash placeholder for an image
 * This is a simple implementation - for production, consider using a proper blurhash library
 * @param width - Placeholder width
 * @param height - Placeholder height
 * @returns Data URL for placeholder
 */
export function generatePlaceholder(width: number = 40, height: number = 40): string {
  // Create a simple gradient placeholder
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#e0e0e0')
  gradient.addColorStop(1, '#f5f5f5')
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}
