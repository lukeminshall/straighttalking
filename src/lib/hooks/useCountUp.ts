import { useEffect, useRef, useState } from 'react'

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

interface Options {
  duration?: number
  decimals?: number
  start?: boolean
}

/**
 * Counts from 0 to `to`. When `start` is omitted it triggers on first
 * intersection; bind the returned ref to the element you want to observe.
 */
export function useCountUp(to: number, { duration = 1600, decimals = 0, start }: Options = {}) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLElement>(null)
  const ran = useRef(false)

  useEffect(() => {
    const run = () => {
      if (ran.current) return
      ran.current = true
      const t0 = performance.now()
      const tick = (t: number) => {
        const p = Math.min(1, (t - t0) / duration)
        setValue(to * easeOut(p))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }

    if (start === true) {
      run()
      return
    }
    if (start === false) return

    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.4 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [to, duration, start])

  return { value: value.toFixed(decimals), ref }
}
