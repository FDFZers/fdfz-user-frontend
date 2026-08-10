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

  // 注入 challenge 并自动求解
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onLoad = () => {
      el.configure?.({ challenge })
        .then(() => el.verify?.())
        .catch(() => {})
    }
    el.addEventListener('load', onLoad as EventListener)
    return () => {
      el.removeEventListener('load', onLoad as EventListener)
    }
  }, [challenge])

  return <altcha-widget ref={ref as never} />
}
