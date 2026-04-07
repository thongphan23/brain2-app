import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClass = icon ? 'btn btn-icon' : 'btn'
  const sizeClass = size !== 'md' ? `btn-${size}` : ''
  return (
    <button
      className={`${baseClass} ${sizeClass} btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
