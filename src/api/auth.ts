import { api } from './client'

export type AuthSessionStatus = 'active' | 'pending_email' | 'pending_qq' | 'success'
export type NextStep = 'password' | 'email' | 'qq' | 'totp'

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
  next_steps: NextStep[]
  expiresAt: string
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

/** 获取鉴权会话状态 */
export function getSession(sessionId: string): Promise<AuthSession> {
  return api.get<AuthSession>(`/auth/session?session_id=${encodeURIComponent(sessionId)}`)
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
