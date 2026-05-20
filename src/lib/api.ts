import { logger } from './logger'

// ── Error type ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  readonly status: number
  readonly data: unknown

  constructor(status: number, message: string, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data ?? null
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network unavailable') {
    super(message)
    this.name = 'NetworkError'
  }
}

// ── Auth header resolution ────────────────────────────────────────────────────

function resolveAuthHeaders(): Record<string, string> {
  // Lazy import to avoid circular deps; Zustand getState() is safe outside React
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAuthStore } = require('@/stores/auth.store') as {
    useAuthStore: { getState: () => { jwt: string | null; sessionToken: string | null } }
  }
  const { jwt, sessionToken } = useAuthStore.getState()

  if (jwt !== null) {
    return { Authorization: `Bearer ${jwt}` }
  }
  if (sessionToken !== null) {
    return { 'X-Session-Token': sessionToken }
  }
  return {}
}

// ── Base fetch ────────────────────────────────────────────────────────────────

const BASE_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:8000/api/v1'

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestInit = {},
): Promise<T> {
  const isFormData = body instanceof FormData
  const headers: Record<string, string> = {
    ...resolveAuthHeaders(),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
  }

  const serializedBody: BodyInit | undefined =
    body === undefined
      ? undefined
      : isFormData
        ? (body as BodyInit)
        : JSON.stringify(body)

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      // Omit body entirely when undefined — required by exactOptionalPropertyTypes
      ...(serializedBody !== undefined ? { body: serializedBody } : {}),
      ...options,
    })
  } catch (err) {
    logger.warn('Network error', { path, err })
    throw new NetworkError(err instanceof Error ? err.message : 'Network unavailable')
  }

  if (!response.ok) {
    let errorData: unknown = null
    try {
      errorData = await response.json()
    } catch {
      // non-JSON error body
    }
    // noUncheckedIndexedAccess: extract detail first, then narrow
    const detail = (errorData as Record<string, unknown>)?.['detail']
    const message =
      typeof errorData === 'object' &&
      errorData !== null &&
      'detail' in errorData &&
      typeof detail === 'string'
        ? detail
        : response.statusText
    logger.warn('API error', { path, status: response.status, message })
    throw new ApiError(response.status, message, errorData)
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

// ── Exported typed helpers ────────────────────────────────────────────────────

export const api = {
  get<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>('GET', path, undefined, options)
  },

  post<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>('POST', path, body, options)
  },

  patch<T>(path: string, body?: unknown, options?: RequestInit): Promise<T> {
    return request<T>('PATCH', path, body, options)
  },

  del<T>(path: string, options?: RequestInit): Promise<T> {
    return request<T>('DELETE', path, undefined, options)
  },
}
