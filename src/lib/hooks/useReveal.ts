import { useEffect, useRef } from 'react'

/**
 * Adds `data-visible="true"` to the element once it scrolls into view.
 * Pair with the `.reveal` class in global.css.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.14) {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-visible', 'true')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
