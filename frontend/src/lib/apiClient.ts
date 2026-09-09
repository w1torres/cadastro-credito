import { clearSession, getSession, setSession } from './session'
import type { AuthTokens, Session } from '../types/auth'

const API_BASE = `${import.meta.env.VITE_API_URL}/api`

interface ErrorEnvelope {
  success: false
  error: { code: string; message: string }
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  const body = text ? (JSON.parse(text) as unknown) : undefined

  if (!response.ok) {
    const envelope = body as Partial<ErrorEnvelope> | undefined
    throw new ApiError(
      response.status,
      envelope?.error?.code ?? 'UNKNOWN_ERROR',
      envelope?.error?.message ?? 'Ocorreu um erro inesperado.',
    )
  }

  return body as T
}

let refreshPromise: Promise<void> | null = null

async function refreshSession(): Promise<void> {
  const session = getSession()
  if (!session) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Sessão expirada.')
  }

  const response = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: session.refreshToken }),
  })
  const tokens = await parseResponse<AuthTokens>(response)
  const updated: Session = { ...session, ...tokens }
  setSession(updated)
}

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Não injeta o Authorization header nem tenta refresh em 401 (usado por login/refresh). */
  skipAuth?: boolean
}

/**
 * Wrapper fino sobre `fetch`: injeta o token da sessão, faz uma única
 * tentativa de refresh em 401 (repetindo a chamada original uma vez), e
 * lança `ApiError` já traduzindo o envelope `{success:false,error:{...}}`
 * do backend (ver `backend/src/common/filters/http-exception.filter.ts`).
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options

  const doFetch = async (): Promise<Response> => {
    const session = getSession()
    return fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(!skipAuth && session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  let response = await doFetch()

  if (response.status === 401 && !skipAuth && getSession()) {
    try {
      refreshPromise ??= refreshSession().finally(() => {
        refreshPromise = null
      })
      await refreshPromise
      response = await doFetch()
    } catch {
      clearSession()
      throw new ApiError(401, 'UNAUTHORIZED', 'Sessão expirada. Faça login novamente.')
    }
  }

  return parseResponse<T>(response)
}

export const api = {
  get: <T>(path: string, options?: ApiFetchOptions) => apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: ApiFetchOptions) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: ApiFetchOptions) => apiFetch<T>(path, { ...options, method: 'DELETE' }),
}
