import { NextResponse } from 'next/server'
import { logError } from '@/lib/error-handler'

/**
 * CSP Report Endpoint
 * Receives Content Security Policy violation reports
 * Reports are sent automatically by browsers when CSP is violated
 */
export async function POST(request: Request) {
  try {
    const report = await request.json()

    // Extract relevant information from the CSP report
    const cspReport = report['csp-report'] || report

    // Log the CSP violation with context
    logError(new Error('CSP Violation'), {
      context: 'CSP Report',
      violation: {
        'document-uri': cspReport['document-uri'],
        'referrer': cspReport['referrer'],
        'blocked-uri': cspReport['blocked-uri'],
        'violated-directive': cspReport['violated-directive'],
        'effective-directive': cspReport['effective-directive'],
        'original-policy': cspReport['original-policy'],
        'disposition': cspReport['disposition'],
        'script-sample': cspReport['script-sample']?.substring(0, 100), // Truncate to avoid excessive logging
        'status-code': cspReport['status-code'],
      },
    })

    // Return 200 to acknowledge receipt
    // CSP reports are best-effort, so we don't want to block the user
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    // Log parsing errors but don't fail
    logError(error, { context: 'CSP Report parsing' })
    return NextResponse.json({ success: true }, { status: 200 })
  }
}

/**
 * Handle GET requests (for testing)
 */
export async function GET() {
  return NextResponse.json(
    {
      message: 'CSP Report Endpoint',
      method: 'POST',
      description: 'This endpoint receives CSP violation reports from browsers',
    },
    { status: 200 }
  )
}
