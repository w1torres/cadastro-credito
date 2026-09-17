import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/50',
        className,
      )}
      {...props}
    />
  )
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** 'brand' aplica a faixa em gradiente verde (ver protótipo `.section-header`) — usar nos cards principais de cada tela. */
  tone?: 'default' | 'brand'
}

export function CardHeader({ className, tone = 'default', ...props }: CardHeaderProps) {
  if (tone === 'brand') {
    return (
      <div
        className={cn(
          '-mx-6 -mt-6 mb-4 flex items-center justify-between gap-2 rounded-t-xl bg-gradient-to-r from-primary-dark to-primary px-6 py-4 text-white',
          className,
        )}
        {...props}
      />
    )
  }
  return (
    <div
      className={cn(
        'mb-4 flex items-center justify-between gap-2 border-b border-slate-100 pb-4',
        className,
      )}
      {...props}
    />
  )
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-xl font-bold tracking-tight text-slate-900', className)} {...props} />
}
