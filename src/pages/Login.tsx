import { useState } from 'react'
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
import { ArrowRight, ArrowRightToSquare, ChevronLeft, Envelope } from '@gravity-ui/icons'
import { useAuth } from '../auth/AuthContext'
import './Login.css'
import '../base.css'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')

  // 模拟发送邮箱验证码
  const sendCode = () => {
    setSending(true)
    setError('')
    // 模拟网络延迟
    setTimeout(() => {
      setCode(Math.floor(100000 + Math.random() * 900000).toString())
      setCodeSent(true)
      setSending(false)
    }, 600)
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    // 第一步：校验用户名或邮箱
    if (step === 1) {
      const account = (data.account ?? '').trim()
      if (account !== 'testuser' && account !== 'someone@example.com') {
        setError('用户名或邮箱不正确')
        return
      }
      setStep(2)
      return
    }

    // 第二步：校验密码
    if (step === 2) {
      if (data.password !== '123456') {
        setError('密码不正确')
        return
      }
      setStep(3)
      return
    }

    // 第三步：校验验证码并完成登录
    if (!codeSent) {
      setError('请先获取邮箱验证码')
      return
    }
    if (data.code !== code) {
      setError('验证码不正确，请重试')
      return
    }

    // 模拟登录请求：显示 loading，模拟网络延迟后完成
    setSubmitting(true)
    setTimeout(() => {
      login({ username: 'testuser', email: 'someone@example.com' })
      navigate('/')
    }, 800)
  }

  return (
    <div className="login-page">
      <div className="login-page__header">
          <h1>登录</h1>
          <p>欢迎回来，请输入账号信息</p>
        </div>

        <Form className="login-form" onSubmit={onSubmit}>
          {step === 1 && (
            <div className="login-step" key="1">
              <TextField isRequired name="account">
                <Label className='ml-2'>用户名或邮箱</Label>
                <Input />
                <FieldError />
              </TextField>
              <Button type="submit" variant="primary" size="lg" fullWidth>
                继续 <ArrowRight />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="login-step" key="2">
              <div className="login-step__back">
                <Button type="button" variant="ghost" size="sm" onPress={() => setStep(1)}>
                  <ChevronLeft /> 返回
                </Button>
              </div>
              <TextField isRequired name="password" type="password">
                <Label className='ml-2'>密码</Label>
                <Input />
                <FieldError />
              </TextField>
              <Button type="submit" variant="primary" size="lg" fullWidth>
                继续 <ArrowRight />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="login-step" key="3">
              <div className="login-step__back">
                <Button type="button" variant="ghost" size="sm" onPress={() => setStep(2)}>
                  <ChevronLeft /> 返回
                </Button>
              </div>
              <div className="login-code">
                <TextField
                  isRequired
                  name="code"
                  validate={(v) => (/^\d{6}$/.test(v) ? null : '请输入 6 位数字验证码')}
                >
                  <Label className='ml-2'>邮箱验证码</Label>
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
                    onPress={sendCode}
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

              {codeSent && (
                <p className="login-code__hint">
                  模拟验证码已发送至邮箱：<strong>{code}</strong>
                </p>
              )}

              {error && <p className="login-page__error">{error}</p>}

              <Button type="submit" variant="primary" size="lg" fullWidth isDisabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner color="current" />
                    登录中
                  </>
                ) : (
                  <>
                    <ArrowRightToSquare />
                    登录
                  </>
                )}
              </Button>
            </div>
          )}
        </Form>

      <p className="login-page__footer">
        还没有账号？<Link className="login-page__link" to="/signup">注册</Link>
      </p>
    </div>
  )
}

export default Login
