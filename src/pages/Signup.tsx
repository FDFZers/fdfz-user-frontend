import { useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Alert,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
  Tooltip,
  Radio,
  RadioGroup
} from '@heroui/react'
import {
  ArrowRight,
  ChevronLeft,
  Check,
  CircleInfo
} from '@gravity-ui/icons'
import AltchaChallenge from '../components/AltchaChallenge'
import {
  getChallenge,
  register,
  type AltchaChallenge as Challenge,
  type School,
} from '../api/auth'
import { ApiError } from '../api/client'
import './Signup.css'
import '../base.css'

/* 错误信息
  *isNetwork  标记网络错误
  *code       HTTP 状态码
*/
type ErrorInfo = {
  message: string
  code?: number
  isNetwork: boolean
}

function toErrorInfo(e: unknown): ErrorInfo {
  if (e instanceof ApiError) {
    if (e.status === 0) {
      return { message: '网络错误，请检查网络连接', code: e.status, isNetwork: true }
    }
    let message = e.message
    switch (e.error) {
      case 'email_exists':
        message = '该邮箱已经注册过了！'
        break
      case 'qq_exists':
        message = '该 QQ 号已经注册过了！'
        break
      case 'student_num_exists':
        message = '该学号已经注册过了！'
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

function Signup() {
  const [step, setStep] = useState(1)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [school, setSchool] = useState('fdfz')
  const [studentNumber, setStudentNumber] = useState('')
  const [realName, setRealName] = useState('')
  const [authFile, setAuthFile] = useState<File | null>(null)
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ErrorInfo | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const isStep1Valid = account.trim().length > 0
  const isStep2Valid = password.length > 0 && confirm.length > 0 && password === confirm
  const isStep3Valid = Boolean(school)
  const isStep4Valid = studentNumber.trim().length > 0 && realName.trim().length > 0 && authFile !== null
  const passwordMismatch = confirm.length > 0 && password !== confirm

  const goStep = (next: number) => {
    if (next > step) {
      if (step === 1 && !isStep1Valid) return
      if (step === 2 && !isStep2Valid) return
      if (step === 3 && !isStep3Valid) return
      if (step === 4 && !isStep4Valid) return
    }

    const el = cardRef.current
    if (el) {
      el.style.height = `${el.offsetHeight}px`
      void el.offsetHeight
    }
    setStep(next)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isStep4Valid) return
    setError(null)
    setSubmitting(true)
    try {
      setChallenge(await getChallenge())
    } catch (e) {
      setError(toErrorInfo(e))
    } finally {
      setSubmitting(false)
    }
  }

  // ALTCHA 验证通过后，用 payload + 表单数据提交注册请求给管理员
  const onAltchaVerified = async (payload: string) => {
    if (!authFile) return
    setSubmitting(true)
    setError(null)
    try {
      await register({
        material: authFile,
        username: account.trim(),
        password,
        studentNum: studentNumber.trim(),
        realName: realName.trim(),
        school: school as School,
        altchaPayload: payload,
      })
      // 注册请求已提交，等待管理员审核
      setChallenge(null)
      setSubmitted(true)
    } catch (e) {
      setError(toErrorInfo(e))
      setChallenge(null)
    } finally {
      setSubmitting(false)
    }
  }

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
  }, [step])

  return (
    <div className="signup-page flex min-h-screen w-full max-w-[460px] flex-col justify-center px-6 pt-12 pb-16 mx-auto max-[380px]:px-4 max-[380px]:py-4 animate-[signup-page-in_0.45s_var(--ease-out)_both]">
      <div className="signup-page__card overflow-hidden p-7 rounded-[32px] transition-[height_0.3s_var(--ease-out)]" ref={cardRef}>
        <div className="signup-page__header mb-6">
          <h1 className="m-0 mb-1 text-2xl font-semibold text-[var(--foreground)]">注册</h1>
          <p className="m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">欢迎来到 FF Wiki！</p>
        </div>

        {error && (
          <div className="signup-error mb-5">
            {error.isNetwork ? (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>网络错误</Alert.Title>
                  <Alert.Description>
                    {error.message}（错误代码：{error.code}）
                  </Alert.Description>
                </Alert.Content>
              </Alert>
            ) : (
              <p className="m-0 text-sm text-center text-[var(--danger)]">{error.message}</p>
            )}
          </div>
        )}

        {submitted ? (
          <div className="signup-success flex flex-col items-center gap-5 py-6 text-center">
            <div className="signup-success__icon flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)]">
              <Check />
            </div>
            <p className="signup-success__notice m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
              您的注册请求已经发送，我们正在审核。请留意用户群内机器人的通知。
            </p>
            <Button
              type="button"
              size="lg"
              fullWidth
              onPress={() => {
                navigate('../')
              }}
            >
              回到主页
            </Button>
          </div>
        ) : challenge ? (
          <div className="signup-challenge flex flex-col gap-5">
            <div className="signup-step__back text-[8px] p-1">
              <Button type="button" variant="ghost" size="sm" onPress={() => setChallenge(null)}>
                <ChevronLeft /> 返回
              </Button>
            </div>
            <div className="signup-challenge__inner flex flex-col items-center gap-4 py-4">
              <AltchaChallenge challenge={challenge} onVerified={onAltchaVerified} />
              {submitting && (
                <p className="inline-flex items-center gap-2 m-0 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
                  <Spinner color="current" /> 正在提交注册请求…
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
        {step === 1 && (
          <div className='signup-info'>
            <Form
              className='signup-info-form flex flex-col gap-5'
              onSubmit={(e) => {
                e.preventDefault()
                goStep(2)
              }}
            >
            <div className="signup-step flex flex-col gap-5" key="1">
            <TextField isRequired name="account">
              <Label>用户名</Label>
              <Input
                variant="secondary"
                value={account}
                onChange={(event) => setAccount(event.target.value)}
              />
              <FieldError />
            </TextField>

            <Button
              type="button"
              size="lg"
              fullWidth
              isDisabled={!isStep1Valid}
              onPress={() => goStep(2)}
            >
              继续 <ArrowRight />
            </Button>
            </div>
            </Form>
          </div>
        )}

        {step === 2 && (
          <div className='signup-info'>
            <Form
              className='signup-info-form flex flex-col gap-5'
              onSubmit={(e) => {
                e.preventDefault()
                goStep(3)
              }}
            >
            <div className="signup-step flex flex-col gap-5" key="3">
            <div className="signup-step__back text-[8px] p-1">
              <Button type="button" variant="ghost" size="sm" onPress={() => goStep(1)}>
                <ChevronLeft /> 返回
              </Button>
            </div>

            <TextField isRequired name="password" type="password">
              <Label>设置密码</Label>
              <Input
                variant="secondary"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <FieldError />
            </TextField>

            <TextField isRequired name="password-verf" type="password">
              <Label>确认您的密码</Label>
              <Input
                variant="secondary"
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
              <FieldError />
            </TextField>
            {passwordMismatch && (
              <p className="signup-password-mismatch -mt-2 text-[13px] text-[var(--danger)]">两次输入的密码不一致</p>
            )}

            <Button
              type="button"
              size="lg"
              fullWidth
              isDisabled={!isStep2Valid}
              onPress={() => goStep(3)}
            >
              继续 <ArrowRight />
            </Button>
            </div>
            </Form>
          </div>
        )}

        {step === 3 && (
          <div className='signup-auth'>
            <div className="signup-auth__back text-[8px] mb-3 p-1">
              <Button variant="ghost" size="sm" onPress={() => goStep(2)}>
                <ChevronLeft /> 返回
              </Button>
            </div>

          <Form
            className='signup-auth-form flex flex-col gap-5'
            onSubmit={(e) => {
              e.preventDefault()
              goStep(4)
            }}
          >
            <div className="signup-step flex flex-col gap-5" key="4">
            <Label>所在学校</Label>
            <RadioGroup
              value={school}
              name="school-division"
              orientation="horizontal"
              onChange={(value) => setSchool(value)}
            >
              <Radio value="fdfz">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  本部
                </Radio.Content>
              </Radio>
              <Radio value="ffpd">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  浦东分校
                </Radio.Content>
              </Radio>
              <Radio value="ffxh">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  徐汇分校
                </Radio.Content>
              </Radio>
              <Radio value="ffqp">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  青浦分校
                </Radio.Content>
              </Radio>
              <Radio value="ffja">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  静安分校
                </Radio.Content>
              </Radio>
            </RadioGroup>

            <Button
              type="button"
              size="lg"
              fullWidth
              isDisabled={!isStep3Valid}
              onPress={() => goStep(4)}
            >
              验证您的身份 <ArrowRight />
            </Button>
            </div>
            </Form>
          </div>
        )}

        {step === 4 && (
          <div className='signup-auth'>
            <div className="signup-auth__back text-[8px] mb-3 p-1">
              <Button variant="ghost" size="sm" onPress={() => goStep(3)}>
                <ChevronLeft /> 返回
              </Button>
            </div>
            <h1 className="m-0 mb-5 text-lg font-semibold text-center text-[var(--foreground)]">我们需要验证您确实是复旦附中的学生。</h1>

          <Form className='signup-auth-form flex flex-col gap-5' onSubmit={handleSubmit}>
            <div className="signup-step flex flex-col gap-5" key="5">
            <TextField isRequired name="school-num">
              <Label>8 位学号</Label>
              <div className="signup-authfile-row flex items-center gap-2">
                <Input
                  variant="secondary"
                  value={studentNumber}
                  onChange={(event) => setStudentNumber(event.target.value)}
                />
                <Tooltip delay={0}>
                  <Button
                    isIconOnly
                    variant="tertiary"
                    size="sm"
                    className="signup-authfile-tip shrink-0"
                    aria-label="学号说明"
                  >
                    <CircleInfo />
                  </Button>
                  <Tooltip.Content showArrow className="signup-authfile-tooltip max-w-64">
                    <Tooltip.Arrow />
                    <strong>根据分校情况调整班级号</strong>
                    <p>浦东分校 <strong>+20</strong>，如 20292101</p>
                    <p>青浦分校 <strong>+40</strong>，如 20294101</p>
                    <p>徐汇分校 <strong>+60</strong>，如 20296101</p>
                    <p>静安分校请先用 12 班班级号</p>
                  </Tooltip.Content>
                </Tooltip>
              </div>
              <FieldError />
            </TextField>

            <TextField isRequired name="realname">
              <Label>真实姓名</Label>
              <Input
                variant="secondary"
                value={realName}
                onChange={(event) => setRealName(event.target.value)}
              />
              <FieldError />
            </TextField>

            <div className="signup-authfile-field flex flex-col gap-2">
              <Label>上传凭据以证明您的身份</Label>
              <div className="signup-authfile-row flex items-center gap-2">
                <input
                  type="file"
                  name="authfile"
                  required
                  accept="image/*"
                  className="signup-authfile-input flex-1 min-w-0 w-full px-3 py-2.5 rounded-xl border border-[color-mix(in_srgb,var(--foreground)_15%,transparent)] bg-[color-mix(in_srgb,var(--foreground)_4%,transparent)] text-[var(--foreground)] text-sm cursor-pointer [font:inherit]"
                  onChange={(event) => setAuthFile(event.target.files?.[0] ?? null)}
                />
                <Tooltip delay={0}>
                  <Button
                    isIconOnly
                    variant="tertiary"
                    size="sm"
                    className="signup-authfile-tip shrink-0"
                    aria-label="上传凭据说明"
                  >
                    <CircleInfo />
                  </Button>
                  <Tooltip.Content showArrow className="signup-authfile-tooltip max-w-64">
                    <Tooltip.Arrow />
                    <p>例如校园卡、云校截图等</p>
                  </Tooltip.Content>
                </Tooltip>
              </div>
            </div>

            <Button type="submit" size="lg" fullWidth isDisabled={!isStep4Valid}>
              提交注册
            </Button>
            </div>
            </Form>
          </div>
        )}
          </>
        )}
      </div>

      <p className="signup-page__footer mt-5 text-center text-sm text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
        已有账号？<Link className="signup-page__link text-[var(--accent)] no-underline" to="/login">去登录</Link>
      </p>
    </div>
  )
}

export default Signup
