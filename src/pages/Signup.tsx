import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Button,
  Description,
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
  ChevronRight,
  CircleInfo,
  Envelope
} from '@gravity-ui/icons'
import './Signup.css'
import '../base.css'

function Signup() {
  const [step, setStep] = useState(1)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)
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

  return (
    <div className="signup-page">
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
              <Input />
              <FieldError />
            </TextField>

            <TextField isRequired name="qq">
              <Label>QQ ID</Label>
              <div className="signup-authfile-row">
                <Input type="number" />
                <Tooltip delay={0}>
                  <Button
                    isIconOnly
                    variant="tertiary"
                    size="sm"
                    className="signup-authfile-tip"
                    aria-label="QQ 查看说明"
                  >
                    <CircleInfo />
                  </Button>
                  <Tooltip.Content showArrow className="signup-qq-tooltip">
                    <Tooltip.Arrow />
                    <p>前往 QQ <ChevronRight /> 头像 <ChevronRight /> 我的资料 <ChevronRight /> QQ 查看</p>
                  </Tooltip.Content>
                </Tooltip>
              </div>
              <FieldError />
            </TextField>

            <TextField isRequired name="email">
              <Label>邮箱</Label>
              <Input type="email" />
              <FieldError />
            </TextField>

            <Button type="button" size="lg" fullWidth onPress={() => setStep(2)}>
              继续 <ArrowRight />
            </Button>
            </div>
            </Form>
          </div>
        )}

        {step === 2 && (
          <div className='signup-info'>
            <Form className='signup-info-form'>
            <div className="signup-step" key="2">
            <div className="signup-step__back">
              <Button type="button" variant="ghost" size="sm" onPress={() => setStep(1)}>
                <ChevronLeft /> 返回
              </Button>
            </div>
            <div className="signup-code">
              <TextField
                isRequired
                name="code"
                validate={(v) => (/^\d{6}$/.test(v) ? null : '请输入 6 位数字验证码')}
              >
                <Label>邮箱验证码</Label>
                <Input placeholder="6 位验证码" />
                <FieldError />
              </TextField>
              <span
                className={`signup-code__send-wrap${sending ? ' is-sending' : ''}`}
                style={{ width: sending ? '9.5rem' : '7.25rem' }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  onPress={sendCode}
                  isDisabled={sending}
                  className="signup-code__send"
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
              <p className="signup-code__hint">
                模拟验证码已发送至邮箱：<strong>{code}</strong>
              </p>
            )}

            {error && <p className="signup-page__error">{error}</p>}

            <Button type="button" size="lg" fullWidth onPress={() => setStep(3)}>
              设置密码 <ArrowRight />
            </Button>
            </div>
            </Form>
          </div>
        )}

        {step === 3 && (
          <div className='signup-info'>
            <Form className='signup-info-form'>
            <div className="signup-step" key="3">
            <div className="signup-step__back">
              <Button type="button" variant="ghost" size="sm" onPress={() => setStep(2)}>
                <ChevronLeft /> 返回
              </Button>
            </div>

            <TextField
              isRequired
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
            >
              <Label>设置密码</Label>
              <Input />
              <FieldError />
            </TextField>

            <TextField
              isRequired
              name="password-verf"
              type="password"
              value={confirm}
              onChange={setConfirm}
            >
              <Label>确认您的密码</Label>
              <Input />
              <FieldError />
            </TextField>
            {confirm.length > 0 && password !== confirm && (
              <p className="signup-password-mismatch">两次输入的密码不一致</p>
            )}

            <Button type="button" size="lg" fullWidth onPress={() => setStep(4)}>
              验证您的身份 <ArrowRight />
            </Button>
            </div>
            </Form>
          </div>
        )}

        {step === 4 && (
          <div className='signup-auth'>
            <div className="signup-auth__back">
              <Button variant="ghost" size="sm" onPress={() => setStep(3)}>
                <ChevronLeft /> 返回
              </Button>
            </div>
            <h1>我们需要验证您确实是复旦附中的学生。</h1>

          <Form className='signup-auth-form'>
            <div className="signup-step" key="4">
            <Label>所在学校</Label>
            <RadioGroup defaultValue="yangpu" name="school-division" orientation="horizontal">
              <Radio value="yangpu">
                <Radio.Content>
                  <Radio.Control>
                    <Radio.Indicator />
                  </Radio.Control>
                  本部
                </Radio.Content>
                <Description>静安分校同学请先选本部</Description>
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

            <Button type="button" size="lg" fullWidth onPress={() => setStep(5)}>
              继续 <ArrowRight />
            </Button>
            </div>
            </Form>
          </div>
        )}

        {step === 5 && (
          <div className='signup-auth'>
            <div className="signup-auth__back">
              <Button variant="ghost" size="sm" onPress={() => setStep(4)}>
                <ChevronLeft /> 返回
              </Button>
            </div>
            <h1>我们需要验证您确实是复旦附中的学生。</h1>

          <Form className='signup-auth-form'>
            <div className="signup-step" key="5">
            <TextField isRequired name="school-num">
              <Label>8 位学号</Label>
              <div className="signup-authfile-row">
                <Input />
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
                    <p>学号为 8 位数字，可在校园卡或学生证上找到</p>
                  </Tooltip.Content>
                </Tooltip>
              </div>
              <FieldError />
            </TextField>

            <TextField isRequired name="realname">
              <Label>真实姓名</Label>
              <Input />
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

            <Button type="submit" size="lg" fullWidth>
              提交注册
            </Button>
            </div>
            </Form>
          </div>
        )}

      <p className="signup-page__footer">
        已有账号？<Link className="signup-page__link" to="/login">去登录</Link>
      </p>
    </div>
  )
}

export default Signup
