import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Alert,
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
  initLogin,
  subscribeSession,
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

// 错误信息：isNetwork 标记网络错误，code 为 HTTP 状态码（网络错误为 0）
type ErrorInfo = {
  message: string
  code?: number
  isNetwork: boolean
}

function toErrorInfo(e: unknown): ErrorInfo {
  if (e instanceof ApiError) {
    // 网络错误：fetch 抛出异常时 status 为 0
    if (e.status === 0) {
      return { message: '网络错误，请检查网络连接', code: e.status, isNetwork: true }
    }
    let message = e.message
    switch (e.error) {
      case 'auth_failed':
        message = '账号或密码错误'
        break
      case 'auth_session_not_found':
        message = '鉴权会话已过期，请重新登录'
        break
      case 'altcha_invalid':
      case 'altcha_expired':
      case 'altcha_error':
        message = '人机验证失败，请重试'
        break
    }
    return { message, code: e.status, isNetwork: false }
  }
  return { message: '发生未知错误，请稍后重试', isNetwork: false }
}

function fieldError(message: string): ErrorInfo {
  return { message, isNetwork: false }
}

// 网络错误用 Alert 展示并附错误代码，其余用普通文本
function ErrorNotice({ error }: { error: ErrorInfo | null }) {
  if (!error) return null
  if (error.isNetwork) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>网络错误</Alert.Title>
          <Alert.Description>
            {error.message}（错误代码：{error.code}）
          </Alert.Description>
        </Alert.Content>
      </Alert>
    )
  }
  return (
    <p className="login-page__error m-0 text-sm text-center text-[var(--danger)]">{error.message}</p>
  )
}

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [phase, setPhase] = useState<Phase>('account')
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)

  const [error, setError] = useState<ErrorInfo | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isAccountValid = account.trim().length > 0
  const isPasswordValid = password.length > 0
  const isEmailCodeValid = CODE_RE.test(emailCode)
  const isTotpValid = CODE_RE.test(totpCode)

  // 邮箱验证
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)

  // QQ 验证
  const [qqCode, setQqCode] = useState('')

  const cardRef = useRef<HTMLDivElement>(null)
  const finalizedRef = useRef(false)

  const goPhase = useCallback((next: Phase) => {
    const el = cardRef.current
    if (el) {
      el.style.height = `${el.offsetHeight}px`
      void el.offsetHeight
    }
    setPhase(next)
  }, [])

  const currentStep: NextStep | undefined = session?.next_steps?.[0]

  const finalize = useCallback(
    async (sid: string) => {
      if (finalizedRef.current) return
      finalizedRef.current = true
      goPhase('finalizing')
      setError(null)
      try {
        const authTokens = await finalizeLogin(sid)
        login(authTokens, {
          id: 0,
          username: account,
          student_num: null,
          real_name: null,
          school: null,
          sex: 'unknown',
          birthday: null,
          public_email: null,
          public_qq: null,
          bio: '',
          status: 'active',
          created_at: '',
          updated_at: '',
        })
        navigate('/')
      } catch (e) {
        finalizedRef.current = false
        goPhase('verify')
        setError(toErrorInfo(e))
      }
    },
    [account, goPhase, login, navigate],
  )

  // 通过原生 EventSource 订阅会话状态更新（SSE，自动重连，无需轮询）
  useEffect(() => {
    if (!sessionId || phase !== 'verify') return
    const es = subscribeSession(
      sessionId,
      (s) => {
        setSession(s)
        if (s.status === 'completed') {
          void finalize(sessionId)
        }
      },
      (err) => setError(toErrorInfo(err)),
    )
    return () => es.close()
  }, [sessionId, phase, finalize])

  useEffect(() => {
    return () => {
      if (sessionId && !finalizedRef.current) {
        void cancelSession(sessionId).catch(() => {})
      }
    }
  }, [sessionId])

  const startLogin = useCallback(
    async (payload: string) => {
      if (submitting || sessionId) return
      setSubmitting(true)
      setError(null)
      try {
        const { session_id } = await initLogin(payload)
        setSessionId(session_id)
        goPhase('verify')
      } catch (e) {
        setError(toErrorInfo(e))
      } finally {
        setSubmitting(false)
      }
    },
    [submitting, sessionId, goPhase],
  )

  // 第一步：填写邮箱，获取并展示 ALTCHA Challenge
  const submitAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const email = account.trim()
    if (!email) return
    setAccount(email)
    goPhase('challenge')
    try {
      setChallenge(await getChallenge())
    } catch (err) {
      setError(toErrorInfo(err))
      goPhase('account')
    }
  }

  // ALTCHA 验证通过后，用 payload 创建登录鉴权会话
  const onAltchaVerified = (payload: string) => {
    void startLogin(payload)
  }

  const submitPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sessionId) return
    if (!isPasswordValid) {
      setError(fieldError('请输入密码'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await verifyPassword(sessionId, account, password)
    } catch (err) {
      setError(toErrorInfo(err))
    } finally {
      setSubmitting(false)
    }
  }

  const sendEmailCode = async () => {
    if (!sessionId) return
    setSending(true)
    setError(null)
    try {
      await requestEmailCode(sessionId, account)
      setCodeSent(true)
    } catch (err) {
      setError(toErrorInfo(err))
    } finally {
      setSending(false)
    }
  }

  const submitEmailCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sessionId) return
    if (!isEmailCodeValid) {
      setError(fieldError('请输入 6 位数字验证码'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await verifyEmailCode(emailCode)
    } catch (err) {
      setError(toErrorInfo(err))
    } finally {
      setSubmitting(false)
    }
  }

  const submitTotp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!sessionId) return
    if (!isTotpValid) {
      setError(fieldError('请输入 6 位数字验证码'))
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await verifyTotp(sessionId, totpCode)
    } catch (err) {
      setError(toErrorInfo(err))
    } finally {
      setSubmitting(false)
    }
  }

  // 进入 QQ 验证步骤时，向机器人申请验证码（用户需私聊发送给机器人）
  useEffect(() => {
    if (phase === 'verify' && currentStep === 'qq' && sessionId && !qqCode) {
      startQq(sessionId)
        .then(({ code }) => setQqCode(code))
        .catch((err) => setError(toErrorInfo(err)))
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
    goPhase('account')
    setError(null)
  }

  // 新内容渲染后：测量真实高度并过渡（逻辑与注册页一致）
  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return
    const locked = el.style.height
    el.style.height = 'auto'
    const target = el.offsetHeight
    el.style.height = locked
    void el.offsetHeight
    el.style.height = `${target}px`
    const reset = () => {
      if (cardRef.current) cardRef.current.style.height = 'auto'
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return
      reset()
    }
    el.addEventListener('transitionend', onEnd)
    const t = window.setTimeout(reset, 350)
    return () => {
      el.removeEventListener('transitionend', onEnd)
      window.clearTimeout(t)
    }
  }, [phase, currentStep])

  return (
    <div className="login-page flex min-h-screen w-full max-w-[460px] flex-col justify-center px-6 py-10 mx-auto max-[380px]:px-4 max-[380px]:py-4 animate-[login-page-in_0.45s_var(--ease-out)_both]">
      <div className="login-page__card overflow-hidden p-7 rounded-[32px] transition-[height_0.3s_var(--ease-out)]" ref={cardRef}>
        <div className="login-page__header mb-6">
          <h1 className="m-0 mb-1 text-2xl font-semibold text-[var(--foreground)]">登录</h1>
          <p className="m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">欢迎回来，请输入账号信息</p>
        </div>

        <div className="login-form flex flex-col gap-5">
        {phase === 'account' && (
          <div className="login-step flex flex-col gap-5" key="account">
            <Form onSubmit={submitAccount} className="login-step__inner flex flex-col gap-5">
              <TextField isRequired name="email">
                <Label className="ml-2">用户名或邮箱</Label>
                <Input
                  variant="secondary"
                  value={account}
                  onChange={(event) => setAccount(event.target.value)}
                />
                <FieldError />
              </TextField>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isDisabled={!isAccountValid}
              >
                继续 <ArrowRight />
              </Button>
            </Form>
          </div>
        )}

        {phase === 'challenge' && (
          <div className="login-step flex flex-col gap-5" key="challenge">
            <div className="login-step__back text-[8px] p-1">
              <Button type="button" variant="ghost" size="sm" onPress={goBackToAccount}>
                <ChevronLeft /> 返回
              </Button>
            </div>
            <div className="login-challenge flex flex-col items-center gap-4 py-4 className='h-[100px]'">
              {challenge ? (
                <AltchaChallenge challenge={challenge} onVerified={onAltchaVerified} />
              ) : (
                <p className="login-challenge__hint inline-flex items-center gap-2 m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                  <Spinner color="current" /> 正在加载人机验证…
                </p>
              )}
              {submitting && (
                <p className="login-challenge__hint inline-flex items-center gap-2 m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                  <Spinner color="current" /> 正在创建登录会话…
                </p>
              )}
            </div>
            {error && <ErrorNotice error={error} />}
          </div>
        )}

        {phase === 'verify' && session && (
          <div className="login-step flex flex-col gap-5" key={currentStep ?? 'verify-waiting'}>
            <div className="login-step__back text-[8px] p-1">
              <Button type="button" variant="ghost" size="sm" onPress={goBackToAccount}>
                <ChevronLeft /> 返回
              </Button>
            </div>

            {!currentStep && (
              <div className="login-step__inner flex flex-col items-center gap-4 py-4">
                <Spinner color="current" />
                <p className="m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">正在等待下一步验证…</p>
              </div>
            )}

            {currentStep === 'password' && (
              <Form onSubmit={submitPassword} className="login-step__inner flex flex-col gap-5">
                <TextField isRequired name="password" type="password">
                  <Label className="ml-2">密码</Label>
                  <Input
                    variant="secondary"
                    placeholder="请输入密码"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <FieldError />
                </TextField>
                {error && <ErrorNotice error={error} />}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isDisabled={submitting || !isPasswordValid}
                >
                  {submitting ? <Spinner color="current" /> : null}
                  继续 <ArrowRight />
                </Button>
              </Form>
            )}

            {currentStep === 'email' && (
              <Form onSubmit={submitEmailCode} className="login-step__inner flex flex-col gap-5">
                <div className="login-code flex items-end gap-2 max-[380px]:flex-wrap">
                  <TextField
                    isRequired
                    name="code"
                    validate={(v) => (/^\d{6}$/.test(v) ? null : '请输入 6 位数字验证码')}
                  >
                    <Label className="ml-2">邮箱验证码</Label>
                    <Input
                      variant="secondary"
                      placeholder="6 位验证码"
                      value={emailCode}
                      onChange={(event) => setEmailCode(event.target.value)}
                    />
                    <FieldError />
                  </TextField>
                  <span
                    className={`login-code__send-wrap shrink-0 overflow-hidden transition-[width_0.3s_var(--ease-out)]${sending ? ' is-sending' : ''}`}
                    style={{ width: sending ? '9.5rem' : '7.25rem' }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      onPress={sendEmailCode}
                      isDisabled={sending}
                      className="login-code__send w-full whitespace-nowrap"
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
                {codeSent && <p className="login-code__hint -mt-2 text-[13px] text-[var(--accent)] animate-[fade-slide-in_0.3s_var(--ease-out)_both]">验证码已发送至邮箱，请查收。</p>}
                {error && <ErrorNotice error={error} />}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isDisabled={submitting || !isEmailCodeValid}
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
              <div className="login-step__inner flex flex-col gap-5">
                <p className="login-page__hint inline-flex items-center justify-center gap-2 m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                  请向 <strong>QQ 机器人</strong> 私聊发送验证码：
                </p>
                <p className="login-qq-code m-0 p-3 rounded-xl text-xl font-semibold tracking-[0.2em] text-center bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]">{qqCode || '…'}</p>
                <p className="login-page__hint inline-flex items-center justify-center gap-2 m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">发送后请稍候，正在等待验证…</p>
                {error && <ErrorNotice error={error} />}
              </div>
            )}

            {currentStep === 'totp' && (
              <Form onSubmit={submitTotp} className="login-step__inner flex flex-col gap-5">
                <TextField
                  isRequired
                  name="code"
                  validate={(v) => (/^\d{6}$/.test(v) ? null : '请输入 6 位数字验证码')}
                >
                  <Label className="ml-2">TOTP 验证码</Label>
                  <Input
                    variant="secondary"
                    placeholder="6 位验证码"
                    value={totpCode}
                    onChange={(event) => setTotpCode(event.target.value)}
                  />
                  <FieldError />
                </TextField>
                {error && <ErrorNotice error={error} />}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isDisabled={submitting || !isTotpValid}
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
          <div className="login-step flex flex-col gap-5" key="finalizing">
            <p className="login-page__hint inline-flex items-center justify-center gap-2 m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
              <Spinner color="current" /> 正在登录…
            </p>
            {error && <ErrorNotice error={error} />}
          </div>
        )}
        </div>
      </div>

      <p className="login-page__footer mt-5 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
        还没有账号？<Link className="login-page__link text-[var(--accent)] cursor-pointer" to="/signup">注册</Link>
      </p>
    </div>
  )
}

export default Login
