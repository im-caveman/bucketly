import { useState, useEffect } from "react"
import { followUser, unfollowUser, isFollowingUser } from "@/lib/user-follow-service"
import { toast } from "sonner"

export function useUserFollow(userId: string | undefined) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingFollow, setIsCheckingFollow] = useState(true)

  useEffect(() => {
    if (userId) {
      checkFollowStatus()
    }
  }, [userId])

  const checkFollowStatus = async () => {
    if (!userId) {
      setIsCheckingFollow(false)
      return
    }

    try {
      setIsCheckingFollow(true)
      const following = await isFollowingUser(userId)
      setIsFollowing(following)
    } catch (error: any) {
      console.error("Error checking follow status:", error?.message || error)
      // Silently fail - user just won't see follow status initially
    } finally {
      setIsCheckingFollow(false)
    }
  }

  const toggleFollow = async () => {
    if (!userId || isLoading) return

    try {
      setIsLoading(true)

      if (isFollowing) {
        await unfollowUser(userId)
        setIsFollowing(false)
        toast.success("Unfollowed successfully")
      } else {
        await followUser(userId)
        setIsFollowing(true)
        toast.success("Following successfully")
      }
    } catch (error: any) {
      // Better error logging and message extraction
      const errorMessage = error?.message || error?.error_description || error?.msg || "Failed to update follow status"
      console.error("Error toggling follow:", {
        message: errorMessage,
        error: error,
        userId: userId,
        isFollowing: isFollowing
      })
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isFollowing,
    isLoading,
    isCheckingFollow,
    toggleFollow,
  }
}
