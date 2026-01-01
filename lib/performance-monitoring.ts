// Performance monitoring utilities for production optimization
export interface PerformanceMetrics {
  fcp?: number // First Contentful Paint
  lcp?: number // Largest Contentful Paint
  ttfb?: number // Time to First Byte
  domInteractive?: number // DOM Interactive
  loadTime?: number // Page Load Time
  bundleSize?: number // Bundle size in KB
}

export interface WebVitals {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
}

// Performance thresholds based on industry standards
export const PERFORMANCE_THRESHOLDS = {
  FCP: {
    good: 1.8,
    needsImprovement: 3.0,
    poor: 4.0
  },
  LCP: {
    good: 2.5,
    needsImprovement: 4.0,
    poor: 6.0
  },
  TTFB: {
    good: 800,
    needsImprovement: 1800,
    poor: 3000
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    poor: 0.5
  },
  BUNDLE_SIZE: {
    good: 250, // KB
    needsImprovement: 500,
    poor: 1000
  }
}

// Calculate performance rating
export function getPerformanceRating(value: number, thresholds: { good: number; needsImprovement: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needsImprovement) return 'needs-improvement'
  return 'poor'
}

// Measure Core Web Vitals
export function measureWebVitals(callback: (metrics: WebVitals[]) => void) {
  if (typeof window === 'undefined') return

  // Check if browser supports necessary APIs
  if (!('PerformanceObserver' in window)) {
    console.warn('PerformanceObserver not supported')
    return
  }

  // Create observers for different vitals
  const observers: (PerformanceObserver | any)[] = []

  try {
    // First Contentful Paint
    const fcpObserver = new PerformanceObserver((list: any) => {
      for (const entry of list.getEntries()) {
        const value = entry.startTime
        const rating = getPerformanceRating(value, PERFORMANCE_THRESHOLDS.FCP)
        
        callback([{
          id: `fcp-${Date.now()}`,
          name: 'FCP',
          value,
          rating,
          delta: 0
        }])
      }
    })
    
    fcpObserver.observe({ entryTypes: ['paint'] })
    observers.push(fcpObserver)

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list: any) => {
      for (const entry of list.getEntries()) {
        const value = entry.startTime
        const rating = getPerformanceRating(value, PERFORMANCE_THRESHOLDS.LCP)
        
        callback([{
          id: `lcp-${Date.now()}`,
          name: 'LCP',
          value,
          rating,
          delta: 0
        }])
      }
    })
    
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    observers.push(lcpObserver)

    // Cumulative Layout Shift
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list: any) => {
      let latestEntry: any = null
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
          latestEntry = entry
        }
      }

      const rating = getPerformanceRating(clsValue, PERFORMANCE_THRESHOLDS.CLS)

      callback([{
        id: `cls-${Date.now()}`,
        name: 'CLS',
        value: clsValue,
        rating,
        delta: latestEntry ? (latestEntry as any).value : 0
      }])
    })
    
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    observers.push(clsObserver)

  } catch (error) {
    console.error('Performance monitoring error:', error)
  }

  // Cleanup function
  return () => {
    observers.forEach((observer: any) => observer.disconnect())
  }
}

// Track bundle size (client-side only)
export function trackBundleSize() {
  if (typeof window === 'undefined') return

  // Measure bundle performance
  const navigation = (performance as any).getEntriesByType?.('navigation')?.[0] as any
  
  if (navigation) {
    const loadTime = navigation.loadEventEnd - navigation.navigationStart
    
    return {
      loadTime,
      domInteractive: navigation.domContentLoadedEventEnd - navigation.navigationStart,
      ttfb: navigation.responseStart - navigation.navigationStart
    }
  }
  
  return null
}

// Resource timing analysis
export function analyzeResourcePerformance() {
  if (typeof window === 'undefined') return

  const resources = (performance as any).getEntriesByType?.('resource') as any[] || []
  const analysis = {
    totalRequests: resources.length,
    totalSize: 0,
    slowResources: [] as any[],
    resourceTypes: {} as Record<string, number>
  }

  resources.forEach((resource: any) => {
    // Categorize resources
    const url = new URL(resource.name)
    const extension = url.pathname.split('.').pop()?.toLowerCase() || ''
    
    if (['js', 'css', 'html'].includes(extension)) {
      analysis.resourceTypes.script = (analysis.resourceTypes.script || 0) + 1
    } else if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'].includes(extension)) {
      analysis.resourceTypes.image = (analysis.resourceTypes.image || 0) + 1
    } else if (['woff', 'woff2', 'ttf'].includes(extension)) {
      analysis.resourceTypes.font = (analysis.resourceTypes.font || 0) + 1
    }

    // Calculate size if available
    if (resource.transferSize) {
      analysis.totalSize += resource.transferSize
    }

    // Identify slow resources (> 2 seconds)
    const loadTime = resource.responseEnd - resource.requestStart
    if (loadTime > 2000) {
      analysis.slowResources.push(resource)
    }
  })

  return analysis
}

// Performance budget checker
export function checkPerformanceBudgets(metrics: PerformanceMetrics) {
  const violations: string[] = []

  if (metrics.bundleSize && metrics.bundleSize > PERFORMANCE_THRESHOLDS.BUNDLE_SIZE.poor) {
    violations.push(`Bundle size ${(metrics.bundleSize / 1024).toFixed(1)}KB exceeds budget of ${PERFORMANCE_THRESHOLDS.BUNDLE_SIZE.poor}KB`)
  }

  if (metrics.fcp && metrics.fcp > PERFORMANCE_THRESHOLDS.FCP.poor) {
    violations.push(`FCP ${metrics.fcp.toFixed(0)}ms exceeds budget of ${PERFORMANCE_THRESHOLDS.FCP.poor}ms`)
  }

  if (metrics.lcp && metrics.lcp > PERFORMANCE_THRESHOLDS.LCP.poor) {
    violations.push(`LCP ${metrics.lcp.toFixed(0)}ms exceeds budget of ${PERFORMANCE_THRESHOLDS.LCP.poor}ms`)
  }

  if (metrics.ttfb && metrics.ttfb > PERFORMANCE_THRESHOLDS.TTFB.poor) {
    violations.push(`TTFB ${metrics.ttfb}ms exceeds budget of ${PERFORMANCE_THRESHOLDS.TTFB.poor}ms`)
  }

  return {
    violations,
    passed: violations.length === 0,
    score: Math.max(0, 100 - (violations.length * 25)) // Simple scoring
  }
}