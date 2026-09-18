import { useEffect, useRef } from 'react'
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
 * Não usa `flex-wrap`: com mais etapas do que cabem numa linha (ver
 * Documentos/Assinatura, Fase 5/6), quebrar linha deixava a linha
 * conectora do último item da fileira "pendurada" apontando pro nada.
 * Rola horizontalmente em vez de quebrar — a etapa atual fica sempre
 * visível (`scrollIntoView`).
 */
export function Stepper({ steps, currentStep }: StepperProps) {
  const activeRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [currentStep])

  return (
    <ol className="flex items-center gap-y-3 overflow-x-auto pb-1">
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isDone = index < currentStep
        return (
          <li
            key={step.label}
            ref={isActive ? activeRef : undefined}
            className="flex shrink-0 items-center"
          >
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors',
                  isActive && 'border-primary-dark bg-primary-dark text-white',
                  isDone &&
                    'border-emerald-300 bg-emerald-100 text-primary-dark',
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
                  'whitespace-nowrap text-sm font-medium',
                  isActive
                    ? 'text-primary-dark'
                    : isDone
                      ? 'text-emerald-700'
                      : 'text-slate-500',
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
