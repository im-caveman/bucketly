import { useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'

// Admin email - can be expanded to an array for multiple admins
const ADMIN_EMAILS = ['tsunyoxi@gmail.com']

export function useAdmin() {
    const { user, loading } = useAuth()

    const isAdmin = useMemo(() => {
        if (!user?.email) return false
        return ADMIN_EMAILS.includes(user.email.toLowerCase())
    }, [user?.email])

    return {
        isAdmin,
        isLoading: loading
    }
}
