import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creditRequestsApi } from './creditRequestsApi'
import { useAuth } from '../auth/AuthContext'
import { getAvailableActions } from '../../lib/workflow'
import type { WorkflowActionKind } from '../../lib/workflow'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Modal } from '../../components/ui/Modal'
import { SelectField, TextareaField } from '../../components/ui/Field'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import {
  CREDIT_REQUEST_STATUS_LABELS,
  CREDIT_REQUEST_STATUS_VARIANT,
  formatCurrency,
  formatDateTime,
} from '../../lib/labels'
import {
  cancelSchema,
  rejectSchema,
  returnSchema,
} from '../../schemas/workflow.schema'
import type {
  CancelFormValues,
  RejectFormValues,
  ReturnFormValues,
} from '../../schemas/workflow.schema'

const EDITABLE_STATUSES = ['DRAFT', 'RETURNED_TO_CONSULTANT']

export function CreditRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const queryClient = useQueryClient()
  const [modalAction, setModalAction] = useState<
    'RETURN' | 'REJECT' | 'CANCEL' | null
  >(null)
  const [confirmAction, setConfirmAction] = useState<
    'SUBMIT' | 'APPROVE' | null
  >(null)

  const { data: creditRequest, isLoading } = useQuery({
    queryKey: ['credit-request', id],
    queryFn: () => creditRequestsApi.get(id!),
    enabled: Boolean(id),
  })
  const { data: history } = useQuery({
    queryKey: ['credit-request-history', id],
    queryFn: () => creditRequestsApi.history(id!),
    enabled: Boolean(id),
  })

  function onError(error: unknown) {
    showError(
      error instanceof ApiError
        ? error.message
        : 'Não foi possível concluir a ação.',
    )
  }

  function onActionSuccess(message: string) {
    showSuccess(message)
    void queryClient.invalidateQueries({ queryKey: ['credit-request', id] })
    void queryClient.invalidateQueries({
      queryKey: ['credit-request-history', id],
    })
    void queryClient.invalidateQueries({ queryKey: ['credit-requests'] })
    setModalAction(null)
    setConfirmAction(null)
  }

  const submitMutation = useMutation({
    mutationFn: (expectedUpdatedAt: string) =>
      creditRequestsApi.submit(id!, { expectedUpdatedAt }),
    onSuccess: () => onActionSuccess('Solicitação enviada com sucesso.'),
    onError,
  })
  const approveMutation = useMutation({
    mutationFn: (expectedUpdatedAt: string) =>
      creditRequestsApi.approve(id!, { expectedUpdatedAt }),
    onSuccess: () => onActionSuccess('Solicitação aprovada.'),
    onError,
  })
  const returnMutation = useMutation({
    mutationFn: (values: ReturnFormValues) =>
      creditRequestsApi.return(id!, {
        ...values,
        expectedUpdatedAt: creditRequest!.updatedAt,
      }),
    onSuccess: () => onActionSuccess('Solicitação devolvida.'),
    onError,
  })
  const rejectMutation = useMutation({
    mutationFn: (values: RejectFormValues) =>
      creditRequestsApi.reject(id!, {
        ...values,
        expectedUpdatedAt: creditRequest!.updatedAt,
      }),
    onSuccess: () => onActionSuccess('Solicitação reprovada.'),
    onError,
  })
  const cancelMutation = useMutation({
    mutationFn: (values: CancelFormValues) =>
      creditRequestsApi.cancel(id!, {
        reason: values.reason || undefined,
        expectedUpdatedAt: creditRequest!.updatedAt,
      }),
    onSuccess: () => onActionSuccess('Solicitação cancelada.'),
    onError,
  })

  if (isLoading) return <Spinner />
  if (!creditRequest || !user)
    return <EmptyState title="Solicitação não encontrada" />

  const isOwner = creditRequest.consultantId === user.id
  const actions = getAvailableActions(creditRequest.status, user.role, isOwner)
  const canEdit =
    (user.role === 'ADMIN' || isOwner) &&
    EDITABLE_STATUSES.includes(creditRequest.status)

  function handleAction(action: WorkflowActionKind) {
    if (action === 'SUBMIT' || action === 'APPROVE') {
      setConfirmAction(action)
    } else {
      setModalAction(action)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Solicitação de Crédito</CardTitle>
          <Badge variant={CREDIT_REQUEST_STATUS_VARIANT[creditRequest.status]}>
            {CREDIT_REQUEST_STATUS_LABELS[creditRequest.status]}
          </Badge>
        </CardHeader>

        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Valor solicitado</dt>
            <dd className="text-slate-900">
              {formatCurrency(creditRequest.requestedCreditLimit)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Cliente</dt>
            <dd>
              <Link
                to={`/clients/${creditRequest.clientId}`}
                className="font-medium text-primary hover:underline"
              >
                Ver cliente
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Criada em</dt>
            <dd className="text-slate-900">
              {formatDateTime(creditRequest.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Última atualização</dt>
            <dd className="text-slate-900">
              {formatDateTime(creditRequest.updatedAt)}
            </dd>
          </div>
        </dl>

        <ul className="mt-4 flex flex-col gap-1 text-sm text-slate-600">
          {creditRequest.leasedAreaPlanting && (
            <li>
              Plantio em área arrendada (
              {creditRequest.leasedAreaPlantingHectares} ha)
            </li>
          )}
          {creditRequest.firstHarvestAreaPlanting && (
            <li>Plantio de primeira safra na área</li>
          )}
          {creditRequest.barterModality && (
            <li>Modalidade de troca (barter)</li>
          )}
          {creditRequest.hasRenegotiatedDebts && (
            <li>Possui dívidas renegociadas</li>
          )}
          {creditRequest.landAcquisition && (
            <li>
              Aquisição de terras — {creditRequest.landAcquisitionHectares} ha
              em {creditRequest.landAcquisitionLocation} (
              {creditRequest.landAcquisitionYear},{' '}
              {creditRequest.landAcquisitionInstallments} parcelas)
            </li>
          )}
          {creditRequest.newMachineryAcquisition && (
            <li>Maquinário novo — {creditRequest.newMachineryDescription}</li>
          )}
          {creditRequest.otherActivity && (
            <li>Outra atividade — {creditRequest.otherActivityDescription}</li>
          )}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {canEdit && (
            <Link
              to={`/credit-requests/${creditRequest.id}/edit`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Editar
            </Link>
          )}
          {actions.map((option) => (
            <Button
              key={option.action}
              type="button"
              size="sm"
              variant={option.variant}
              onClick={() => handleAction(option.action)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        {!history || history.length === 0 ? (
          <EmptyState title="Sem histórico" />
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="border-b border-slate-100 pb-2 last:border-0"
              >
                <p className="text-slate-900">
                  {entry.fromStatus
                    ? CREDIT_REQUEST_STATUS_LABELS[entry.fromStatus]
                    : 'Criada'}{' '}
                  → {CREDIT_REQUEST_STATUS_LABELS[entry.toStatus]}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDateTime(entry.createdAt)}
                </p>
                {entry.reason && (
                  <p className="mt-1 text-slate-600">Motivo: {entry.reason}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <ConfirmDialog
        open={confirmAction === 'SUBMIT'}
        title="Enviar solicitação"
        description="Deseja enviar esta solicitação para a próxima etapa?"
        isLoading={submitMutation.isPending}
        onConfirm={() => submitMutation.mutate(creditRequest.updatedAt)}
        onClose={() => setConfirmAction(null)}
      />
      <ConfirmDialog
        open={confirmAction === 'APPROVE'}
        title="Aprovar solicitação"
        description="Deseja aprovar esta solicitação de crédito?"
        isLoading={approveMutation.isPending}
        onConfirm={() => approveMutation.mutate(creditRequest.updatedAt)}
        onClose={() => setConfirmAction(null)}
      />

      <ReturnModal
        open={modalAction === 'RETURN'}
        targets={actions.find((a) => a.action === 'RETURN')?.targets}
        isLoading={returnMutation.isPending}
        onSubmit={(values) => returnMutation.mutate(values)}
        onClose={() => setModalAction(null)}
      />
      <RejectModal
        open={modalAction === 'REJECT'}
        isLoading={rejectMutation.isPending}
        onSubmit={(values) => rejectMutation.mutate(values)}
        onClose={() => setModalAction(null)}
      />
      <CancelModal
        open={modalAction === 'CANCEL'}
        isLoading={cancelMutation.isPending}
        onSubmit={(values) => cancelMutation.mutate(values)}
        onClose={() => setModalAction(null)}
      />
    </div>
  )
}

function ReturnModal({
  open,
  targets,
  isLoading,
  onSubmit,
  onClose,
}: {
  open: boolean
  targets?: { value: string; label: string }[]
  isLoading: boolean
  onSubmit: (values: ReturnFormValues) => void
  onClose: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReturnFormValues>({ resolver: zodResolver(returnSchema) })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Devolver solicitação">
      <form
        onSubmit={(e) =>
          void handleSubmit((values) => {
            onSubmit(values)
            reset()
          })(e)
        }
        className="flex flex-col gap-4"
        noValidate
      >
        {targets && targets.length > 1 && (
          <SelectField
            label="Devolver para"
            required
            placeholder="Selecione..."
            error={errors.targetStatus?.message}
            {...register('targetStatus')}
          >
            {targets.map((target) => (
              <option key={target.value} value={target.value}>
                {target.label}
              </option>
            ))}
          </SelectField>
        )}
        <TextareaField
          label="Motivo"
          required
          error={errors.reason?.message}
          {...register('reason')}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="danger" isLoading={isLoading}>
            Devolver
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function RejectModal({
  open,
  isLoading,
  onSubmit,
  onClose,
}: {
  open: boolean
  isLoading: boolean
  onSubmit: (values: RejectFormValues) => void
  onClose: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectFormValues>({ resolver: zodResolver(rejectSchema) })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Reprovar solicitação">
      <form
        onSubmit={(e) =>
          void handleSubmit((values) => {
            onSubmit(values)
            reset()
          })(e)
        }
        className="flex flex-col gap-4"
        noValidate
      >
        <TextareaField
          label="Motivo"
          required
          error={errors.reason?.message}
          {...register('reason')}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="danger" isLoading={isLoading}>
            Reprovar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function CancelModal({
  open,
  isLoading,
  onSubmit,
  onClose,
}: {
  open: boolean
  isLoading: boolean
  onSubmit: (values: CancelFormValues) => void
  onClose: () => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelFormValues>({ resolver: zodResolver(cancelSchema) })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Cancelar solicitação">
      <form
        onSubmit={(e) =>
          void handleSubmit((values) => {
            onSubmit(values)
            reset()
          })(e)
        }
        className="flex flex-col gap-4"
        noValidate
      >
        <TextareaField
          label="Motivo (opcional)"
          error={errors.reason?.message}
          {...register('reason')}
        />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button type="submit" variant="danger" isLoading={isLoading}>
            Cancelar solicitação
          </Button>
        </div>
      </form>
    </Modal>
  )
}
