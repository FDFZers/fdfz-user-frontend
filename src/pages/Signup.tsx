import { useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
  Tooltip,
  Radio,
  RadioGroup
} from '@heroui/react'
import {
  ArrowRight,
  ChevronLeft,
  CircleInfo
} from '@gravity-ui/icons'
import './Signup.css'
import '../base.css'

function Signup() {
  const [step, setStep] = useState(1)
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [school, setSchool] = useState('yangpu')
  const [studentNumber, setStudentNumber] = useState('')
  const [realName, setRealName] = useState('')
  const [authFile, setAuthFile] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  const isStep1Valid = account.trim().length > 0
  const isStep2Valid = password.length > 0 && confirm.length > 0 && password === confirm
  const isStep3Valid = Boolean(school)
  const isStep4Valid = studentNumber.trim().length > 0 && realName.trim().length > 0 && authFile.length > 0
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

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!isStep4Valid) {
      return
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
    <div className="signup-page">
      <div className="signup-page__card" ref={cardRef}>
        <div className="signup-page__header">
          <h1>注册</h1>
          <p>欢迎来到 FF Wiki！</p>
        </div>

        {step === 1 && (
          <div className='signup-info'>
            <Form className='signup-info-form'>
            <div className="signup-step" key="1">
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
            <Form className='signup-info-form'>
            <div className="signup-step" key="3">
            <div className="signup-step__back">
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
              <p className="signup-password-mismatch">两次输入的密码不一致</p>
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
            <div className="signup-auth__back">
              <Button variant="ghost" size="sm" onPress={() => goStep(2)}>
                <ChevronLeft /> 返回
              </Button>
            </div>

          <Form className='signup-auth-form'>
            <div className="signup-step" key="4">
            <Label>所在学校</Label>
            <RadioGroup
              value={school}
              name="school-division"
              orientation="horizontal"
              onChange={(value) => setSchool(value)}
            >
              <Radio value="yangpu">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  本部
                </Radio.Content>
              </Radio>
              <Radio value="pudong">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  浦东分校
                </Radio.Content>
              </Radio>
              <Radio value="xuhui">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  徐汇分校
                </Radio.Content>
              </Radio>
              <Radio value="qingpu">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  青浦分校
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
            <div className="signup-auth__back">
              <Button variant="ghost" size="sm" onPress={() => goStep(3)}>
                <ChevronLeft /> 返回
              </Button>
            </div>
            <h1>我们需要验证您确实是复旦附中的学生。</h1>

          <Form className='signup-auth-form' onSubmit={handleSubmit}>
            <div className="signup-step" key="5">
            <TextField isRequired name="school-num">
              <Label>8 位学号</Label>
              <div className="signup-authfile-row">
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
                    className="signup-authfile-tip"
                    aria-label="学号说明"
                  >
                    <CircleInfo />
                  </Button>
                  <Tooltip.Content showArrow className="signup-authfile-tooltip">
                    <Tooltip.Arrow />
                    <strong>根据分校情况调整班级号</strong>
                    <p>浦东分校 <strong>+20</strong>，如 20292101</p>
                    <p>青浦分校 <strong>+40</strong>，如 20294101</p>
                    <p>徐汇分校 <strong>+60</strong>，如 20296101</p>
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

            <div className="signup-authfile-field">
              <Label>上传凭据以证明您的身份</Label>
              <div className="signup-authfile-row">
                <input
                  type="file"
                  name="authfile"
                  required
                  className="signup-authfile-input"
                  onChange={(event) => setAuthFile(event.target.files?.[0]?.name ?? '')}
                />
                <Tooltip delay={0}>
                  <Button
                    isIconOnly
                    variant="tertiary"
                    size="sm"
                    className="signup-authfile-tip"
                    aria-label="上传凭据说明"
                  >
                    <CircleInfo />
                  </Button>
                  <Tooltip.Content showArrow className="signup-authfile-tooltip">
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
      </div>

      <p className="signup-page__footer">
        已有账号？<Link className="signup-page__link" to="/login">去登录</Link>
      </p>
    </div>
  )
}

export default Signup
