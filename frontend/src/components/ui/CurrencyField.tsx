import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { useController } from 'react-hook-form'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { formatCurrency } from '../../lib/labels'
import { cn } from '../../lib/cn'

interface CurrencyFieldProps<TFieldValues extends FieldValues> {
  name: FieldPath<TFieldValues>
  control: Control<TFieldValues>
  label: string
  required?: boolean
  hint?: string
}

/** Máscara de moeda BRL "estilo calculadora": os dígitos digitados sempre preenchem a partir dos centavos. */
function digitsToDecimalString(digits: string): string {
  if (!digits) return ''
  return (Number.parseInt(digits, 10) / 100).toFixed(2)
}

export function CurrencyField<TFieldValues extends FieldValues>({
  name,
  control,
  label,
  required,
  hint,
}: CurrencyFieldProps<TFieldValues>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control })

  const [display, setDisplay] = useState(() =>
    field.value ? formatCurrency(field.value as string) : '',
  )

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, '')
    const decimalValue = digitsToDecimalString(digits)
    field.onChange(decimalValue)
    setDisplay(decimalValue ? formatCurrency(decimalValue) : '')
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-bold uppercase tracking-wide text-primary-dark"
      >
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <input
        id={name}
        inputMode="numeric"
        placeholder="R$ 0,00"
        value={display}
        onChange={handleChange}
        onBlur={field.onBlur}
        ref={field.ref}
        aria-invalid={Boolean(error)}
        className={cn(
          'block w-full rounded-md border-0 bg-transparent p-0 text-3xl font-bold text-primary-dark shadow-none focus:outline-none focus:ring-0',
          error && 'text-red-600',
        )}
      />
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-red-600" role="alert">
          {error.message}
        </p>
      )}
    </div>
  )
}
