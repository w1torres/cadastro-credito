import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const controlClassName =
  'block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-100 disabled:text-slate-500'

interface FieldWrapperProps {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

function FieldWrapper({ id, label, error, hint, required, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, hint, required, id, className, ...props }, ref) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    return (
      <FieldWrapper id={fieldId} label={label} error={error} hint={hint} required={required}>
        <input
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          className={cn(controlClassName, error && 'border-red-500 focus:border-red-500 focus:ring-red-500', className)}
          {...props}
        />
      </FieldWrapper>
    )
  },
)
InputField.displayName = 'InputField'

type TextareaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: string
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, required, id, className, ...props }, ref) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    return (
      <FieldWrapper id={fieldId} label={label} error={error} hint={hint} required={required}>
        <textarea
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          rows={3}
          className={cn(controlClassName, error && 'border-red-500 focus:border-red-500 focus:ring-red-500', className)}
          {...props}
        />
      </FieldWrapper>
    )
  },
)
TextareaField.displayName = 'TextareaField'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
  placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, hint, required, id, className, placeholder, children, ...props }, ref) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    return (
      <FieldWrapper id={fieldId} label={label} error={error} hint={hint} required={required}>
        <select
          ref={ref}
          id={fieldId}
          required={required}
          aria-invalid={Boolean(error)}
          defaultValue=""
          className={cn(controlClassName, error && 'border-red-500 focus:border-red-500 focus:ring-red-500', className)}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      </FieldWrapper>
    )
  },
)
SelectField.displayName = 'SelectField'

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const generatedId = useId()
    const fieldId = id ?? generatedId
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={fieldId} className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            className={cn('size-4 rounded border-slate-300 text-primary focus:ring-primary', className)}
            {...props}
          />
          {label}
        </label>
        {error && (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  },
)
CheckboxField.displayName = 'CheckboxField'
