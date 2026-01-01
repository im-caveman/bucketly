'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })

    // Call custom error handler
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return (
          <FallbackComponent
            error={this.state.error!}
            resetError={() => this.resetError()}
          />
        )
      }

      // Default fallback
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-6">
            <div className="mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.932-3.268L13.06 4c.283-1.066-.508-2.326-.508-3.538 0-1.504.527-2.916 1.51-4.246 1.438-2.592 1.09-4.526 2.511-5.87a1.5 1.5 0 00-.578-.378L13.421 4.84c-.324-.411-.537-.91-.537-1.438 0-1.276.673-2.262 1.626-3.738.643-1.99 1.354-3.567 2.794-.749.995-.854 1.722-.577 2.982.301 1.261.059 2.685-.697 2.868 1.486.305 1.529.932 3.159 2.565 4.904a1.5 1.5 0 011.591 1.608l7.332 6.941z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4 max-w-md">
              We encountered an unexpected error. Don't worry, we've been notified and are working on it.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => this.resetError()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Reload Page
              </button>
            </div>
            <div className="mt-6 text-sm text-gray-500">
              If this problem persists, please{' '}
              <a
                href="mailto:support@bucketly.app"
                className="text-indigo-600 hover:text-indigo-500"
              >
                contact our support team
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }

  private resetError() {
    this.setState({ hasError: false, error: undefined })
  }
}

// Hook for functional components
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error('useErrorHandler caught error:', error, errorInfo)

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: errorInfo ? {
        react: {
          componentStack: errorInfo.componentStack
        }
      } : undefined
    })
  }, [])
}

// Default fallback component
export function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="text-center p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Component Error
      </h2>
      <p className="text-gray-600 mb-4">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetError}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Retry
      </button>
    </div>
  )
}