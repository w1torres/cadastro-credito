import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface StepperStep {
  label: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number
}

/**
 * Indicador visual de etapas do wizard — mesma linguagem visual do `.stage`
 * do protótipo original (ativo = verde sólido, concluído = verde claro).
 *
 * Mostra todas as etapas em grade, sem rolagem horizontal: com a rolagem,
 * as etapas finais (Documentos/Assinatura/Revisão) ficavam escondidas fora
 * da tela e o usuário não as percebia.
 */
export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol
      className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-6"
      aria-label="Etapas da solicitação"
    >
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isDone = index < currentStep
        return (
          <li
            key={step.label}
            aria-current={isActive ? 'step' : undefined}
            className="flex min-w-0 items-center gap-2"
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                isActive && 'border-primary-dark bg-primary-dark text-white',
                isDone && 'border-emerald-300 bg-emerald-100 text-primary-dark',
                !isActive &&
                  !isDone &&
                  'border-slate-300 bg-white text-slate-400',
              )}
            >
              {isDone ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                'text-sm font-medium leading-tight',
                isActive
                  ? 'text-primary-dark'
                  : isDone
                    ? 'text-emerald-700'
                    : 'text-slate-500',
              )}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
