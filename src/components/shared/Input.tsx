import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, className = '', ...props }: InputProps) {
  return (
    <div className="input-field">
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {hint && !error && <p className="input-hint">{hint}</p>}
      {error && <p className="input-error-msg">{error}</p>}
    </div>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
}

export function Textarea({ label, hint, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="input-field">
      {label && <label className="input-label">{label}</label>}
      <textarea
        className={`input textarea ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {hint && !error && <p className="input-hint">{hint}</p>}
      {error && <p className="input-error-msg">{error}</p>}
    </div>
  )
}
