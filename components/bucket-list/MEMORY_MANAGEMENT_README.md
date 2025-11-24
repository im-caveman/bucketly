# Memory Management Components

This directory contains components for managing memories associated with completed bucket list items.

## Components

### 1. UploadMemoryDialog
Dialog for uploading a new memory with photos and reflection text.

**Props:**
- `isOpen`: boolean - Controls dialog visibility
- `onClose`: () => void - Callback when dialog closes
- `onMemoryUploaded`: () => void - Callback after successful upload
- `itemId`: string - ID of the bucket item
- `itemTitle`: string - Title of the bucket item (for display)
- `userId`: string - ID of the current user

**Features:**
- Multiple photo upload with preview
- Photo validation (10MB max per photo)
- Reflection text with character count (10-5000 chars)
- Privacy toggle (public/private)
- Form validation

### 2. MemoryGallery
Displays a gallery of memories for a specific bucket item.

**Props:**
- `itemId`: string - ID of the bucket item
- `currentUserId?`: string - ID of the current user (for filtering)
- `onEdit?`: (memory) => void - Callback when edit is requested
- `onDelete?`: (memoryId) => void - Callback when delete is requested

**Features:**
- Grid layout with memory cards
- Photo thumbnails with count indicator
- Privacy badges
- Click to view full details
- Empty state when no memories exist
- Filters memories based on privacy settings

### 3. MemoryDetailDialog
Shows full details of a memory with photo carousel.

**Props:**
- `memory`: Memory - The memory object to display
- `isOpen`: boolean - Controls dialog visibility
- `onClose`: () => void - Callback when dialog closes
- `canEdit`: boolean - Whether user can edit/delete
- `onEdit`: () => void - Callback when edit is clicked
- `onDelete`: () => void - Callback when delete is clicked

**Features:**
- Photo carousel for multiple images
- Full reflection text display
- Metadata (date, author)
- Edit and delete actions (if authorized)
- Delete confirmation dialog

### 4. EditMemoryDialog
Dialog for editing an existing memory.

**Props:**
- `isOpen`: boolean - Controls dialog visibility
- `onClose`: () => void - Callback when dialog closes
- `onMemoryUpdated`: () => void - Callback after successful update
- `memory`: Memory - The memory object to edit
- `userId`: string - ID of the current user

**Features:**
- Edit reflection text
- Add/remove photos
- Change privacy settings
- Photo management (delete existing, upload new)
- Form validation

### 5. MemoryManager
Comprehensive component that manages all memory operations.

**Props:**
- `itemId`: string - ID of the bucket item
- `itemTitle`: string - Title of the bucket item
- `userId`: string - ID of the current user
- `isItemCompleted`: boolean - Whether the item is completed
- `onMemoryChange?`: () => void - Callback when memories change

**Features:**
- Integrates all memory components
- Handles upload, edit, delete workflows
- Manages dialog states
- Provides delete confirmation
- Refreshes gallery after changes

## Usage Example

### Basic Integration

```tsx
import { MemoryManager } from "@/components/bucket-list/memory-manager"
import { useAuth } from "@/contexts/auth-context"

function BucketItemPage({ itemId, itemTitle, isCompleted }) {
  const { user } = useAuth()

  return (
    <div>
      <h1>{itemTitle}</h1>
      
      {/* Other item details */}
      
      <MemoryManager
        itemId={itemId}
        itemTitle={itemTitle}
        userId={user.id}
        isItemCompleted={isCompleted}
        onMemoryChange={() => {
          // Optional: Refresh parent data
          console.log("Memories updated")
        }}
      />
    </div>
  )
}
```

### Individual Component Usage

```tsx
import { UploadMemoryDialog } from "@/components/bucket-list/upload-memory-dialog"
import { MemoryGallery } from "@/components/bucket-list/memory-gallery"

function CustomMemoryView({ itemId, userId }) {
  const [showUpload, setShowUpload] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <>
      <button onClick={() => setShowUpload(true)}>
        Upload Memory
      </button>

      <MemoryGallery
        key={refreshKey}
        itemId={itemId}
        currentUserId={userId}
      />

      <UploadMemoryDialog
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onMemoryUploaded={() => {
          setRefreshKey(prev => prev + 1)
          setShowUpload(false)
        }}
        itemId={itemId}
        itemTitle="My Bucket Item"
        userId={userId}
      />
    </>
  )
}
```

## Service Functions

The components use the following service functions from `lib/bucket-list-service.ts`:

### Memory Operations
- `createMemory(userId, memoryData)` - Create a new memory
- `updateMemory(memoryId, updates)` - Update an existing memory
- `deleteMemory(memoryId)` - Delete a memory and its photos
- `fetchMemoriesForItem(itemId)` - Get all memories for an item
- `fetchMemoriesForUser(userId)` - Get all memories for a user

### Photo Operations
- `uploadMemoryPhoto(userId, file)` - Upload a photo to storage
- `deleteMemoryPhoto(photoUrl)` - Delete a photo from storage

## Data Types

```typescript
interface Memory {
  id: string
  user_id: string
  bucket_item_id: string
  reflection: string
  photos: string[]  // Array of photo URLs
  is_public: boolean
  created_at: string
  updated_at: string
  profiles?: {
    username: string
    avatar_url: string | null
  }
}

interface CreateMemoryData {
  bucket_item_id: string
  reflection: string
  photos: string[]
  is_public: boolean
}

interface UpdateMemoryData {
  reflection?: string
  photos?: string[]
  is_public?: boolean
}
```

## Validation Rules

### Photos
- Maximum 10MB per photo
- Supported formats: JPG, PNG, GIF, WebP
- Stored in Supabase Storage bucket: `memory-photos`
- Path structure: `{userId}/{timestamp}-{random}.{ext}`

### Reflection Text
- Minimum: 10 characters
- Maximum: 5000 characters
- Required field

### Privacy
- Default: Public (true)
- Public memories visible in social feeds
- Private memories only visible to owner

## Storage Structure

Photos are stored in Supabase Storage:
- Bucket: `memory-photos`
- Path: `{userId}/{filename}`
- Public access enabled
- RLS policies enforce user ownership

## Error Handling

All components include:
- Form validation with error messages
- Toast notifications for success/error
- Loading states during async operations
- Graceful error recovery
- User-friendly error messages

## Requirements Covered

This implementation satisfies the following requirements from the design document:

- **Requirement 6.1**: Create memory for completed items
- **Requirement 6.2**: Upload photos (max 10MB)
- **Requirement 6.3**: Reflection text validation (10-5000 chars)
- **Requirement 6.4**: Timeline event creation on memory upload
- **Requirement 6.5**: Privacy settings for memories

## Notes

- Memories can only be created for completed items
- Users can only edit/delete their own memories
- Photo deletion from storage is handled automatically
- Gallery refreshes automatically after changes
- All operations are optimistic with error rollback
