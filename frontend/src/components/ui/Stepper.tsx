import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface StepperStep {
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
}

/** Indicador visual de etapas do wizard — mesma linguagem visual do `.stage` do protótipo original (ativo = verde sólido, concluído = verde claro). */
export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="flex flex-wrap items-center gap-y-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isDone = index < currentStep
        return (
          <li key={step.label} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                  isActive && 'border-primary-dark bg-primary-dark text-white',
                  isDone && 'border-emerald-300 bg-emerald-100 text-primary-dark',
                  !isActive && !isDone && 'border-slate-300 bg-white text-slate-400',
                )}
              >
                {isDone ? <Check className="size-4" aria-hidden="true" /> : index + 1}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-primary-dark' : isDone ? 'text-emerald-700' : 'text-slate-500',
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'mx-3 h-0.5 w-6 shrink-0 rounded sm:w-10',
                  isDone ? 'bg-emerald-300' : 'bg-slate-200',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
