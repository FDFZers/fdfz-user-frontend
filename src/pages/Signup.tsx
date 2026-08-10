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
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  // 切换步骤：先锁定当前高度，再切换内容；随后由 useLayoutEffect 测量新高度并过渡
  const goStep = (next: number) => {
    const el = cardRef.current
    if (el) {
      el.style.height = `${el.offsetHeight}px`
      void el.offsetHeight // 强制回流，确保起始高度已提交
    }
    setStep(next)
  }

  // 新内容渲染后：测量真实高度并过渡。关键：必须先把高度放开为 auto 再测量，
  // 否则当新内容比锁定高度矮时，scrollHeight 会返回当前高度而非内容高度。
  useLayoutEffect(() => {
    const el = cardRef.current
    if (!el) return
    const locked = el.style.height
    el.style.height = 'auto'
    const target = el.offsetHeight // 新内容真实高度
    el.style.height = locked // 恢复起始高度，作为过渡起点
    void el.offsetHeight // 强制回流，确保起点已提交
    el.style.height = `${target}px`
    const reset = () => {
      if (cardRef.current) cardRef.current.style.height = 'auto'
    }
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'height') return
      reset()
    }
    el.addEventListener('transitionend', onEnd)
    // 兜底：相邻两步高度相同时不会触发 transition，用定时器复位为 auto
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
              <Input variant="secondary" />
              <FieldError />
            </TextField>

            <Button type="button" size="lg" fullWidth onPress={() => goStep(2)}>
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

            <TextField
              isRequired
              name="password"
              type="password"
              value={password}
              onChange={setPassword}
            >
              <Label>设置密码</Label>
              <Input variant="secondary" />
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
              <Input variant="secondary" />
              <FieldError />
            </TextField>
            {confirm.length > 0 && password !== confirm && (
              <p className="signup-password-mismatch">两次输入的密码不一致</p>
            )}

            <Button type="button" size="lg" fullWidth onPress={() => goStep(3)}>
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
            <RadioGroup defaultValue="yangpu" name="school-division" orientation="horizontal">
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

            <Button type="button" size="lg" fullWidth onPress={() => goStep(4)}>
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

          <Form className='signup-auth-form'>
            <div className="signup-step" key="5">
            <TextField isRequired name="school-num">
              <Label>8 位学号</Label>
              <div className="signup-authfile-row">
                <Input variant="secondary" />
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
              <Input variant="secondary" />
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
      </div>

      <p className="signup-page__footer">
        已有账号？<Link className="signup-page__link" to="/login">去登录</Link>
      </p>
    </div>
  )
}

export default Signup
