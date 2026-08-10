import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from '@heroui/react'
import { ArrowRight, ChevronLeft, Envelope } from '@gravity-ui/icons'
import { useAuth } from '../auth/AuthContext'
import AltchaChallenge from '../components/AltchaChallenge'
import {
  cancelSession,
  finalizeLogin,
  getChallenge,
  getSession,
  initLogin,
  requestEmailCode,
  startQq,
  verifyEmailCode,
  verifyPassword,
  verifyTotp,
  type AltchaChallenge as Challenge,
  type AuthSession,
  type NextStep,
} from '../api/auth'
import { ApiError } from '../api/client'
import './Login.css'
import '../base.css'

type Phase = 'account' | 'challenge' | 'verify' | 'finalizing'

const CODE_RE = /^\d{6}$/

function errMsg(e: unknown): string {
  if (e instanceof ApiError) {
    switch (e.error) {
      case 'auth_failed':
        return '账号或密码错误'
      case 'auth_session_not_found':
        return '鉴权会话已过期，请重新登录'
      case 'altcha_invalid':
      case 'altcha_expired':
      case 'altcha_error':
        return '人机验证失败，请重试'
      default:
        return e.message
    }
  }
  return '发生未知错误，请稍后重试'
}

function Login() {
  const navigate = useNavigate()
  const { login, tokens } = useAuth()

  const [phase, setPhase] = useState<Phase>('account')
  const [account, setAccount] = useState('')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)

  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 邮箱验证码步骤
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)

  // QQ 验证步骤
  const [qqCode, setQqCode] = useState('')

  const finalizedRef = useRef(false)

  const currentStep: NextStep | undefined = session?.next_steps?.[0]

  // 登录成功：用 session_id 换取令牌并保存
  const finalize = useCallback(
    async (sid: string) => {
      if (finalizedRef.current) return
      finalizedRef.current = true
      setPhase('finalizing')
      setError('')
      try {
        const authTokens = await finalizeLogin(sid)
        login(authTokens, { username: account, email: account })
        navigate('/')
      } catch (e) {
        finalizedRef.current = false
        setPhase('verify')
        setError(errMsg(e))
      }
    },
    [account, login, navigate],
  )

  // 刷新会话状态；鉴权成功后自动换取令牌
  const refreshSession = useCallback(
    async (sid: string) => {
      try {
        const s = await getSession(sid)
        setSession(s)
        if (s.status === 'success') {
          await finalize(sid)
        }
      } catch (e) {
        setError(errMsg(e))
      }
    },
    [finalize],
  )

  // 轮询会话状态（建议 5s 一次）
  useEffect(() => {
    if (!sessionId || phase !== 'verify') return
    const id = setInterval(() => {
      void refreshSession(sessionId)
    }, 5000)
    return () => clearInterval(id)
  }, [sessionId, phase, refreshSession])

  // 组件卸载/退出时取消尚未完成的鉴权会话
  useEffect(() => {
    return () => {
      if (sessionId && !finalizedRef.current) {
        void cancelSession(sessionId).catch(() => {})
      }
    }
  }, [sessionId])

  // 第一步：填写邮箱，获取并展示 ALTCHA Challenge
  const submitAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim()
    if (!email) return
    setAccount(email)
    setPhase('challenge')
    try {
      setChallenge(await getChallenge())
    } catch (err) {
      setError(errMsg(err))
      setPhase('account')
    }
  }

  // ALTCHA 验证通过后，用 payload 创建登录鉴权会话
  const onAltchaVerified = async (payload: string) => {
    if (submitting || sessionId) return
    setSubmitting(true)
    setError('')
    try {
      const { session_id } = await initLogin(tokens?.trust_token ?? null, payload)
      setSessionId(session_id)
      setPhase('verify')
      await refreshSession(session_id)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setSubmitting(false)
    }
  }

  const submitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sessionId) return
    setSubmitting(true)
    setError('')
    const password = String(new FormData(e.currentTarget).get('password') ?? '')
    try {
      await verifyPassword(sessionId, account, password)
      await refreshSession(sessionId)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  const sendEmailCode = async () => {
    if (!sessionId) return
    setSending(true)
    setError('')
    try {
      await requestEmailCode(sessionId, account)
      setCodeSent(true)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSending(false)
    }
  }

  const submitEmailCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sessionId) return
    setSubmitting(true)
    setError('')
    const code = String(new FormData(e.currentTarget).get('code') ?? '')
    if (!CODE_RE.test(code)) {
      setError('请输入 6 位数字验证码')
      setSubmitting(false)
      return
    }
    try {
      await verifyEmailCode(code)
      await refreshSession(sessionId)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  const submitTotp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sessionId) return
    setSubmitting(true)
    setError('')
    const code = String(new FormData(e.currentTarget).get('code') ?? '')
    try {
      await verifyTotp(sessionId, code)
      await refreshSession(sessionId)
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setSubmitting(false)
    }
  }

  // 进入 QQ 验证步骤时，向机器人申请验证码（用户需私聊发送给机器人）
  useEffect(() => {
    if (phase === 'verify' && currentStep === 'qq' && sessionId && !qqCode) {
      startQq(sessionId)
        .then(({ code }) => setQqCode(code))
        .catch((err) => setError(errMsg(err)))
    }
  }, [phase, currentStep, sessionId, qqCode])

  const goBackToAccount = () => {
    if (sessionId && !finalizedRef.current) {
      void cancelSession(sessionId).catch(() => {})
    }
    setSessionId(null)
    setSession(null)
    setQqCode('')
    setCodeSent(false)
    setPhase('account')
    setError('')
  }

  return (
    <div className="login-page">
      <div className="login-page__header">
        <h1>登录</h1>
        <p>欢迎回来，请输入账号信息</p>
      </div>

      <div className="login-form">
        {phase === 'account' && (
          <div className="login-step" key="account">
            <Form onSubmit={submitAccount} className="login-step__inner">
              <TextField isRequired name="email">
                <Label className="ml-2">邮箱</Label>
                <Input type="email" placeholder="you@example.com" />
                <FieldError />
              </TextField>
              <Button type="submit" variant="primary" size="lg" fullWidth>
                继续 <ArrowRight />
              </Button>
            </Form>
          </div>
        )}

        {phase === 'challenge' && (
          <div className="login-step" key="challenge">
            <div className="login-step__back">
              <Button type="button" variant="ghost" size="sm" onPress={goBackToAccount}>
                <ChevronLeft /> 返回
              </Button>
            </div>
            <div className="login-challenge">
              {challenge ? (
                <AltchaChallenge challenge={challenge} onVerified={onAltchaVerified} />
              ) : (
                <p className="login-challenge__hint">
                  <Spinner color="current" /> 正在加载人机验证…
                </p>
              )}
              {submitting && (
                <p className="login-challenge__hint">
                  <Spinner color="current" /> 正在创建登录会话…
                </p>
              )}
            </div>
            {error && <p className="login-page__error">{error}</p>}
          </div>
        )}

        {phase === 'verify' && session && currentStep && (
          <div className="login-step" key={`verify-${currentStep}`}>
            <div className="login-step__back">
              <Button type="button" variant="ghost" size="sm" onPress={goBackToAccount}>
                <ChevronLeft /> 返回
              </Button>
            </div>

            {currentStep === 'password' && (
              <Form onSubmit={submitPassword} className="login-step__inner">
                <TextField isRequired name="password" type="password">
                  <Label className="ml-2">密码</Label>
                  <Input placeholder="请输入密码" />
                  <FieldError />
                </TextField>
                {error && <p className="login-page__error">{error}</p>}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isDisabled={submitting}
                >
                  {submitting ? <Spinner color="current" /> : null}
                  继续 <ArrowRight />
                </Button>
              </Form>
            )}

            {currentStep === 'email' && (
              <Form onSubmit={submitEmailCode} className="login-step__inner">
                <div className="login-code">
                  <TextField
                    isRequired
                    name="code"
                    validate={(v) => (/^\d{6}$/.test(v) ? null : '请输入 6 位数字验证码')}
                  >
                    <Label className="ml-2">邮箱验证码</Label>
                    <Input placeholder="6 位验证码" />
                    <FieldError />
                  </TextField>
                  <span
                    className={`login-code__send-wrap${sending ? ' is-sending' : ''}`}
                    style={{ width: sending ? '9.5rem' : '7.25rem' }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      onPress={sendEmailCode}
                      isDisabled={sending}
                      className="login-code__send"
                      fullWidth
                    >
                      <Envelope />
                      {sending ? (
                        <>
                          <Spinner color="current" />
                          发送中
                        </>
                      ) : codeSent ? (
                        '重新发送'
                      ) : (
                        '获取验证码'
                      )}
                    </Button>
                  </span>
                </div>
                {codeSent && <p className="login-code__hint">验证码已发送至邮箱，请查收。</p>}
                {error && <p className="login-page__error">{error}</p>}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isDisabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner color="current" />
                      验证中
                    </>
                  ) : (
                    '验证'
                  )}
                </Button>
              </Form>
            )}

            {currentStep === 'qq' && (
              <div className="login-step__inner">
                <p className="login-page__hint">
                  请向 <strong>QQ 机器人</strong> 私聊发送验证码：
                </p>
                <p className="login-qq-code">{qqCode || '…'}</p>
                <p className="login-page__hint">发送后请稍候，正在等待验证…</p>
                {error && <p className="login-page__error">{error}</p>}
              </div>
            )}

            {currentStep === 'totp' && (
              <Form onSubmit={submitTotp} className="login-step__inner">
                <TextField
                  isRequired
                  name="code"
                  validate={(v) => (/^\d{6}$/.test(v) ? null : '请输入 6 位数字验证码')}
                >
                  <Label className="ml-2">TOTP 验证码</Label>
                  <Input placeholder="6 位验证码" />
                  <FieldError />
                </TextField>
                {error && <p className="login-page__error">{error}</p>}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isDisabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner color="current" />
                      验证中
                    </>
                  ) : (
                    '验证'
                  )}
                </Button>
              </Form>
            )}
          </div>
        )}

        {phase === 'finalizing' && (
          <div className="login-step" key="finalizing">
            <p className="login-page__hint">
              <Spinner color="current" /> 正在登录…
            </p>
            {error && <p className="login-page__error">{error}</p>}
          </div>
        )}
      </div>

      <p className="login-page__footer">
        还没有账号？<Link className="login-page__link" to="/signup">注册</Link>
      </p>
    </div>
  )
}

export default Login
