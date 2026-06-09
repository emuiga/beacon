import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8000/api/v1'

  try {
    const res = await fetch(`${apiUrl}/stats/summary`, {
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    })
    const backendOk = res.ok

    return NextResponse.json(
      {
        status: backendOk ? 'ok' : 'degraded',
        backend: backendOk,
        timestamp: new Date().toISOString(),
      },
      { status: backendOk ? 200 : 503 },
    )
  } catch {
    return NextResponse.json(
      { status: 'outage', backend: false, timestamp: new Date().toISOString() },
      { status: 503 },
    )
  }
}
