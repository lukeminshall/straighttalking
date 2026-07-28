import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

type Variant = 'primary' | 'teal' | 'ghost' | 'ghost-dark'
type Size = 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  as?: 'button'
  children: ReactNode
}

interface LinkProps {
  variant?: Variant
  size?: Size
  as: 'a'
  href: string
  children: ReactNode
  className?: string
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', size = 'md', className } = props
  const cls = cx(styles.btn, styles[variant], size === 'lg' && styles.lg, className)

  if (props.as === 'a') {
    const { href, children } = props
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    )
  }

  const { as: _as, variant: _v, size: _s, className: _c, children, ...rest } = props
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  )
}
