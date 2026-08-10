// 统一的 API 请求封装。
// 开发环境下由 Vite 将 `/api` 代理到后端（见 vite.config.ts）。
export const API_BASE = '/api'

export class ApiError extends Error {
  status: number
  error?: string

  constructor(status: number, error?: string) {
    super(error ? `请求失败 (${status})：${error}` : `请求失败 (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.error = error
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError(0, '网络错误，请检查网络连接')
  }

  const text = await res.text()
  let data: unknown
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = undefined
    }
  }

  if (!res.ok) {
    const error =
      data && typeof (data as { error?: unknown }).error === 'string'
        ? (data as { error: string }).error
        : undefined
    throw new ApiError(res.status, error)
  }

  return data as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
