'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  showIcon?: boolean
  children?: React.ReactNode
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className,
  showIcon = true,
  children,
}: LogoutButtonProps) {
  const router = useRouter()
  const { signOut } = useAuth()

  const handleLogout = async () => {
    try {
      const { error } = await signOut()

      if (error) {
        toast.error('Failed to log out')
        return
      }

      toast.success('Logged out successfully')
      router.push('/auth/login')
    } catch (error) {
      toast.error('An unexpected error occurred')
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {children || 'Log out'}
    </Button>
  )
}
