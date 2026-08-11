// 统一的 API 请求封装。
// 后端连接主目录（Apifox Mock 服务器），所有接口在此基础路径下拼接。
export const API_BASE = 'http://127.0.0.1:4523/m1/8686325-8470616-default'

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
    // FormData 无需手动设置 Content-Type（浏览器会自动带 boundary）
    const isForm = init?.body instanceof FormData
    res = await fetch(`${API_BASE}${path}`, {
      headers: isForm ? undefined : { 'Content-Type': 'application/json' },
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
  postForm: <T>(path: string, form: FormData) =>
    request<T>(path, { method: 'POST', body: form }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
