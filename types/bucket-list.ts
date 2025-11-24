export type Category =
  | "adventures"
  | "places"
  | "cuisines"
  | "books"
  | "songs"
  | "monuments"
  | "acts-of-service"
  | "miscellaneous"

export interface BucketListItem {
  id: string
  title: string
  description: string
  points: number
  difficulty?: "easy" | "medium" | "hard"
  location?: string
  completed: boolean
  completedDate?: string
}

export interface BucketList {
  id: string
  name: string
  description: string
  category: Category
  items: BucketListItem[]
  isFollowing: boolean
  followers: number
  createdBy: string
  isPublic: boolean
}

export interface UserProfile {
  id: string
  username: string
  avatar: string
  bio: string
  totalPoints: number
  globalRank: number
  itemsCompleted: number
  listsFollowing: number
  listsCreated: number
}

export type TimelineEventType =
  | "item_completed"
  | "memory_uploaded"
  | "memory_shared"
  | "list_created"
  | "list_followed"
  | "achievement_unlocked"

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  title: string
  description: string
  timestamp: string
  itemTitle?: string
  listName?: string
  photos?: string[]
  points?: number
  isPublic?: boolean
  thumbnail?: string
}

export interface Memory {
  id: string
  itemId: string
  listName: string
  itemTitle: string
  photos: string[]
  reflection: string
  points: number
  isPublic: boolean
  completedDate: string
}
