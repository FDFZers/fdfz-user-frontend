import { api, API_BASE, ApiError } from './client'

export type AuthSessionStatus = 'active' | 'pending_email' | 'pending_qq' | 'completed'
export type NextStep = 'password' | 'email' | 'qq' | 'totp'

export type School = 'fdfz' | 'ffpd' | 'ffqp' | 'ffxh' | 'ffja'
export type Sex = 'unknown' | 'male' | 'female'

export interface AltchaChallengeParameters {
  algorithm: string
  nonce: string
  salt: string
  cost: number
  keyLength: number
  keyPrefix: string
}

export interface AltchaChallenge {
  parameters: AltchaChallengeParameters
}

export interface AuthSession {
  id: string
  type: 'register' | 'login' | 'stepup'
  status: AuthSessionStatus
  prev_steps: NextStep[]
  next_steps: NextStep[]
  created_at: string
  expires_at: string
}

export interface AuthTokens {
  token: string
  refresh_token: string
  token_expires_at: string
  refresh_token_expires_at: string
}

/** 获取 ALTCHA Challenge */
export function getChallenge(): Promise<AltchaChallenge> {
  return api.get<AltchaChallenge>('/auth/challenge')
}

/** 请求登录，创建鉴权会话 */
export function initLogin(
  altchaPayload: string,
): Promise<{ session_id: string }> {
  return api.post<{ session_id: string }>('/auth/login/init', {
    altcha_payload: altchaPayload,
  })
}

/** 获取鉴权会话状态（SSE，取首个事件解析为 AuthSession） */
export async function getSession(sessionId: string): Promise<AuthSession> {
  const res = await fetch(`${API_BASE}/auth/session/${encodeURIComponent(sessionId)}`, {
    headers: { Accept: 'text/event-stream' },
  })
  if (!res.ok) {
    let error: string | undefined
    try {
      const json = (await res.json()) as { error?: string }
      error = json.error
    } catch {
      error = undefined
    }
    throw new ApiError(res.status, error)
  }
  const text = await res.text()
  // SSE 事件之间以空行分隔，取第一个事件解析
  const firstEvent = text.split(/\n\s*\n/)[0] || text
  const data: Record<string, string> = {}
  for (const line of firstEvent.split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (key && value) data[key] = value
  }
  const parseArr = (raw?: string): NextStep[] => {
    if (!raw) return []
    try {
      const arr = JSON.parse(raw) as unknown
      return Array.isArray(arr) ? (arr as NextStep[]) : []
    } catch {
      return []
    }
  }
  return {
    id: data.id ?? '',
    type: (data.type as AuthSession['type']) ?? 'login',
    status: (data.status as AuthSessionStatus) ?? 'active',
    prev_steps: parseArr(data.prev_steps),
    next_steps: parseArr(data.next_steps),
    created_at: data.created_at ?? '',
    expires_at: data.expires_at ?? '',
  }
}

/** 取消鉴权会话 */
export function cancelSession(sessionId: string): Promise<Record<string, never>> {
  return api.delete<Record<string, never>>(`/auth/session/${encodeURIComponent(sessionId)}`)
}

/** 邮箱 + 密码验证 */
export function verifyPassword(
  sessionId: string,
  email: string,
  password: string,
): Promise<Record<string, never>> {
  return api.post<Record<string, never>>('/auth/session/password', {
    session_id: sessionId,
    email,
    password,
  })
}

/** 请求邮箱验证码 */
export function requestEmailCode(sessionId: string, email?: string): Promise<Record<string, never>> {
  return api.post<Record<string, never>>('/auth/session/email', {
    session_id: sessionId,
    email: email ?? null,
  })
}

/** 验证邮箱验证码 */
export function verifyEmailCode(emailCode: string): Promise<Record<string, never>> {
  return api.post<Record<string, never>>('/auth/session/verify/email', { email_code: emailCode })
}

/** QQ 验证：返回需要向机器人发送的验证码 */
export function startQq(sessionId: string): Promise<{ code: string }> {
  return api.post<{ code: string }>('/auth/session/qq', { session_id: sessionId })
}

/** TOTP 验证 */
export function verifyTotp(sessionId: string, code: string): Promise<Record<string, never>> {
  return api.post<Record<string, never>>('/auth/session/totp', { session_id: sessionId, code })
}

/** 登录获取令牌 */
export function finalizeLogin(sessionId: string): Promise<AuthTokens> {
  return api.post<AuthTokens>('/auth/login', { session_id: sessionId })
}

export interface RegisterParams {
  /** 佐证材料图片（饭卡/校园网截图等），仅允许图片 */
  material: File
  /** 用户名，任意字符，可重复 */
  username: string
  /** 密码 */
  password: string
  /** 学号 */
  studentNum: string
  /** 真实姓名 */
  realName: string
  /** 所在学校 */
  school: School
  /** ALTCHA 验证载荷 */
  altchaPayload: string
}

/**
 * 请求注册（multipart/form-data）。
 * 需先通过 ALTCHA 人机验证获取 altchaPayload。
 */
export function register(params: RegisterParams): Promise<Record<string, never>> {
  const form = new FormData()
  form.append('material', params.material)
  form.append('username', params.username)
  form.append('password', params.password)
  form.append('student_num', params.studentNum)
  form.append('real_name', params.realName)
  form.append('school', params.school)
  form.append('altcha_payload', params.altchaPayload)
  return api.postForm<Record<string, never>>('/auth/register', form)
}
