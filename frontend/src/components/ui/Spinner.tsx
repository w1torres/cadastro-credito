import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-label="Carregando">
      <Loader2 className={cn('size-6 animate-spin text-primary', className)} aria-hidden="true" />
    </div>
  )
}
