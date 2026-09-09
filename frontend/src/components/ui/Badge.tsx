import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'
import type { StatusBadgeVariant } from '../../lib/labels'

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-800',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-red-100 text-red-700',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: StatusBadgeVariant
}

export function Badge({ variant = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', VARIANT_CLASSES[variant], className)}
      {...props}
    />
  )
}
