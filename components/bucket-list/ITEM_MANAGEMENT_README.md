# Bucket Item Management Features

This document describes the bucket item management features implemented for task 9.

## Components Created

### 1. AddItemDialog (`add-item-dialog.tsx`)
A dialog component for adding new items to a bucket list.

**Props:**
- `isOpen: boolean` - Controls dialog visibility
- `onClose: () => void` - Callback when dialog closes
- `onItemAdded: () => void` - Callback after successful item addition
- `listId: string` - The ID of the bucket list to add the item to

**Features:**
- Form validation (title length, points range)
- All fields: title, description, points, difficulty, location
- Error handling with toast notifications
- Disabled state during submission

### 2. EditItemDialog (`edit-item-dialog.tsx`)
A dialog component for editing existing bucket list items.

**Props:**
- `isOpen: boolean` - Controls dialog visibility
- `onClose: () => void` - Callback when dialog closes
- `onItemUpdated: () => void` - Callback after successful item update
- `item: BucketListItem` - The item to edit

**Features:**
- Pre-populated form with existing item data
- Same validation as AddItemDialog
- Updates only changed fields
- Error handling with toast notifications

### 3. DeleteItemDialog (`delete-item-dialog.tsx`)
An alert dialog for confirming item deletion.

**Props:**
- `isOpen: boolean` - Controls dialog visibility
- `onClose: () => void` - Callback when dialog closes
- `onItemDeleted: () => void` - Callback after successful deletion
- `itemId: string` - The ID of the item to delete
- `itemTitle: string` - The title of the item (for confirmation message)

**Features:**
- Confirmation dialog to prevent accidental deletion
- Shows item title in confirmation message
- Error handling with toast notifications

### 4. ItemCard (Updated)
Enhanced the existing ItemCard component with completion functionality.

**New Features:**
- Automatic API call when checkbox is toggled
- Toast notifications for completion/incompletion
- Points display when item is completed
- Loading state during API call
- Backward compatible with custom `onToggle` prop

## Service Functions Added

Added to `lib/bucket-list-service.ts`:

### `addBucketItem(listId: string, itemData: AddBucketItemData)`
Creates a new bucket item in the specified list.

**Parameters:**
- `listId` - The bucket list ID
- `itemData` - Object containing: title, description, points, difficulty, location

**Returns:** The created item data

### `toggleItemCompletion(itemId: string, completed: boolean)`
Marks an item as completed or incomplete.

**Parameters:**
- `itemId` - The item ID
- `completed` - Boolean indicating completion status

**Returns:** The updated item data

**Note:** This triggers the database trigger that:
- Updates user's total points
- Increments items_completed counter
- Creates a timeline event
- Sets completed_date

### `updateBucketItem(itemId: string, updates: UpdateBucketItemData)`
Updates an existing bucket item.

**Parameters:**
- `itemId` - The item ID
- `updates` - Object with fields to update (title, description, points, difficulty, location)

**Returns:** The updated item data

### `deleteBucketItem(itemId: string)`
Deletes a bucket item.

**Parameters:**
- `itemId` - The item ID

**Returns:** void

## Usage Example

See `app/list/[id]/example-integration.tsx` for a complete example of integrating all features.

### Basic Usage

```tsx
import { AddItemDialog } from "@/components/bucket-list/add-item-dialog"
import { EditItemDialog } from "@/components/bucket-list/edit-item-dialog"
import { DeleteItemDialog } from "@/components/bucket-list/delete-item-dialog"
import { ItemCard } from "@/components/bucket-list/item-card"

function MyListPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialog, setEditDialog] = useState({ isOpen: false, item: null })
  
  const refreshList = async () => {
    // Reload your list data
  }
  
  return (
    <>
      <Button onClick={() => setAddDialogOpen(true)}>Add Item</Button>
      
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onCompletionChange={refreshList}
          onUploadMemory={() => {/* handle memory upload */}}
        />
      ))}
      
      <AddItemDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onItemAdded={refreshList}
        listId={listId}
      />
      
      {editDialog.item && (
        <EditItemDialog
          isOpen={editDialog.isOpen}
          onClose={() => setEditDialog({ isOpen: false, item: null })}
          onItemUpdated={refreshList}
          item={editDialog.item}
        />
      )}
    </>
  )
}
```

## Validation Rules

### Title
- Minimum: 3 characters
- Maximum: 200 characters
- Required

### Description
- Optional
- No length limit in UI (database may have limits)

### Points
- Minimum: 1
- Maximum: 1000
- Required
- Must be a valid integer

### Difficulty
- Options: "easy", "medium", "hard"
- Default: "medium"

### Location
- Optional
- Free text field

## Database Integration

All functions use Supabase client and respect:
- Row Level Security (RLS) policies
- Foreign key constraints
- Database triggers (for item completion)
- Automatic timestamp updates

## Error Handling

All components include:
- Try-catch blocks around API calls
- Toast notifications for success/error
- User-friendly error messages
- Disabled states during operations
- Form validation before submission

## Requirements Satisfied

- ✅ 4.1: Create bucket item with validation
- ✅ 4.2: Title length validation (3-200 chars)
- ✅ 4.3: Points validation (1-1000)
- ✅ 4.4: Difficulty validation (easy/medium/hard)
- ✅ 4.5: Initialize completed status to false
- ✅ 5.1: Mark item as completed with timestamp
- ✅ 5.2: Add points to user total (via trigger)
- ✅ 5.3: Increment items_completed counter (via trigger)
- ✅ 5.4: Create timeline event (via trigger)
- ✅ 5.5: Recalculate global rank (via trigger)
