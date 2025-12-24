import { useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'

import { isAdminEmail } from '@/lib/admin-config'

export function useAdmin() {
    const { user, loading } = useAuth()

    const isAdmin = useMemo(() => {
        return isAdminEmail(user?.email)
    }, [user?.email])

    return {
        isAdmin,
        isLoading: loading
    }
}
