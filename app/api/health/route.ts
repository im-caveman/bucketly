import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { withRateLimit } from '@/lib/rate-limit-middleware'

export async function GET(request: Request) {
  return withRateLimit(request as any, async () => {
  try {
    const startTime = Date.now()
    
    // Check environment variables
    const envChecks = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV,
    }
    
    const envHealthy = Object.values(envChecks).every(Boolean)
    
    // Check database connectivity
    let dbHealthy = false
    let dbError = null
    
    if (envHealthy) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        // Simple health check query
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1)
        
        dbHealthy = !error
        dbError = error?.message
      } catch (err) {
        dbError = err instanceof Error ? err.message : 'Unknown database error'
      }
    }
    
    const overallHealthy = envHealthy && dbHealthy
    const responseTime = Date.now() - startTime
    
    const healthData = {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks: {
        environment: {
          status: envHealthy ? 'pass' : 'fail',
          details: envChecks
        },
        database: {
          status: dbHealthy ? 'pass' : 'fail',
          details: dbError || 'Connected successfully'
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime()
    }
    
    // Return appropriate HTTP status
    const statusCode = overallHealthy ? 200 : 503
    
    return NextResponse.json(healthData, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      checks: {
        environment: { status: 'fail' },
        database: { status: 'fail' }
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
  }
})
}