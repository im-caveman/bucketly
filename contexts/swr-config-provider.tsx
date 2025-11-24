'use client'

import { SWRConfig } from 'swr'
import type { ReactNode } from 'react'

interface SWRConfigProviderProps {
  children: ReactNode
}

export function SWRConfigProvider({ children }: SWRConfigProviderProps) {
  return (
    <SWRConfig
      value={{
        // Global cache configuration
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        
        // Error retry configuration
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        
        // Keep data fresh
        focusThrottleInterval: 5000,
        
        // Global error handler
        onError: (error, key) => {
          console.error('SWR Error:', { key, error })
        },
        
        // Global success handler for cache invalidation strategies
        onSuccess: (data, key, config) => {
          // Can add custom logic here if needed
        },
      }}
    >
      {children}
    </SWRConfig>
  )
}
