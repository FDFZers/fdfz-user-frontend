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

/** 解析 SSE 会话事件负载为 AuthSession */
export function parseAuthSession(payload: Record<string, unknown>): AuthSession {
  const parseArr = (raw?: unknown): NextStep[] => {
    if (Array.isArray(raw)) {
      return raw.filter((item): item is NextStep => typeof item === 'string' && item in ['password', 'email', 'qq', 'totp']) as NextStep[]
    }
    if (typeof raw === 'string') {
      try {
        const arr = JSON.parse(raw) as unknown
        return parseArr(arr)
      } catch {
        return []
      }
    }
    return []
  }

  return {
    id: String(payload.id ?? ''),
    type: (payload.type as AuthSession['type']) ?? 'login',
    status: (payload.status as AuthSessionStatus) ?? 'active',
    prev_steps: parseArr(payload.prev_steps),
    next_steps: parseArr(payload.next_steps),
    created_at: String(payload.created_at ?? ''),
    expires_at: String(payload.expires_at ?? ''),
  }
}

/**
 * 订阅鉴权会话状态更新（SSE）。
 * 使用浏览器原生 EventSource 建立长连接，后端主动推送状态变化，且自带自动重连。
 * 返回的 EventSource 需在组件卸载或不再需要时调用 .close() 释放连接。
 */
export function subscribeSession(
  sessionId: string,
  onUpdate: (session: AuthSession) => void,
  onError?: (error: ApiError) => void,
): EventSource {
  const es = new EventSource(`${API_BASE}/auth/session/${encodeURIComponent(sessionId)}`)
  es.onmessage = (e: MessageEvent<string>) => {
    try {
      onUpdate(parseAuthSession(JSON.parse(e.data) as Record<string, unknown>))
    } catch {
      /* 忽略无法解析的事件 */
    }
  }
  es.onerror = () => {
    // EventSource 会自动重连，这里仅提示瞬时中断
    onError?.(new ApiError(0, '会话连接中断，正在尝试重连'))
  }
  return es
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
