import { useEffect, useRef } from 'react'
import 'altcha'
import type {} from 'altcha/types/react'
import type { AltchaChallenge } from '../api/auth'

interface AltchaElement extends HTMLElement {
  configure?: (config: unknown) => Promise<void>
  verify?: () => Promise<unknown>
}

interface Props {
  challenge: AltchaChallenge
  onVerified: (payload: string) => void
  onStateChange?: (state: string) => void
}

/**
 * 封装 ALTCHA `<altcha-widget>` Web Component。
 * 挂载后注入 challenge 并触发 `verify()`，完成后通过 `verified` 事件返回 payload。
 */
export default function AltchaChallenge({ challenge, onVerified, onStateChange }: Props) {
  const ref = useRef<AltchaElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onVerifiedEvt = (ev: Event) => {
      const detail = (ev as CustomEvent<{ payload: string }>).detail
      onVerified(detail.payload)
    }
    const onStateEvt = (ev: Event) => {
      const detail = (ev as CustomEvent<{ state: string }>).detail
      onStateChange?.(detail.state)
    }

    el.addEventListener('verified', onVerifiedEvt as EventListener)
    el.addEventListener('statechange', onStateEvt as EventListener)
    return () => {
      el.removeEventListener('verified', onVerifiedEvt as EventListener)
      el.removeEventListener('statechange', onStateEvt as EventListener)
    }
  }, [onVerified, onStateChange])

  // 注入 challenge 并自动求解。
  // configure/verify 在自定义元素异步升级（$$c 就绪）后才可用，故等待升级并重试，
  // 避免 load 事件触发时 configure 尚为 undefined。
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let cancelled = false
    const start = async () => {
      try {
        await customElements.whenDefined('altcha-widget')
      } catch {
        return
      }
      const attempt = () => {
        if (cancelled) return
        if (typeof el.configure !== 'function') {
          window.setTimeout(attempt, 30)
          return
        }
        // 注意：configure 是同步方法（返回 undefined），不能链式 .then()；
        // 配置后待 Svelte flush 完成再触发 verify（返回 Promise）。
        el.configure?.({
          challenge,
          // 后端通过后续接口（/auth/login/init、/auth/register）校验 altcha_payload
          verifyUrl: '',
          verifyFunction: async (payload: string) => ({ verified: true, payload }),
        })
        queueMicrotask(() => el.verify?.())
      }
      attempt()
    }
    void start()
    return () => {
      cancelled = true
    }
  }, [challenge])

  return (
    <altcha-widget
      ref={ref as never}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '164px',
        minHeight: '120px',
        height: '120px',
      }}
    />
  )
}
