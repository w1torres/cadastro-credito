import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CreditRequestForm } from './CreditRequestForm'
import { creditRequestsApi } from './creditRequestsApi'
import { toCreateCreditRequestInput } from './mapCreditRequestForm'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import type { CreditRequestFormValues } from '../../schemas/credit-request.schema'

export function NewCreditRequestPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const mutation = useMutation({
    mutationFn: (values: CreditRequestFormValues) =>
      creditRequestsApi.create(toCreateCreditRequestInput(values, clientId!)),
    onSuccess: (creditRequest) => {
      showSuccess('Solicitação de crédito criada com sucesso.')
      navigate(`/credit-requests/${creditRequest.id}`)
    },
    onError: (error: unknown) => {
      showError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar a solicitação.',
      )
    },
  })

  function handleSubmit(values: CreditRequestFormValues) {
    if (!clientId) return Promise.resolve()
    return mutation.mutateAsync(values)
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Nova Solicitação de Crédito</CardTitle>
      </CardHeader>
      <CreditRequestForm
        onSubmit={handleSubmit}
        isSubmitting={mutation.isPending}
      />
    </Card>
  )
}
