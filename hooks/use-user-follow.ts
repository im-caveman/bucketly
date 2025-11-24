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
      console.error("Error toggling follow:", error)
      toast.error(error.message || "Failed to update follow status")
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
