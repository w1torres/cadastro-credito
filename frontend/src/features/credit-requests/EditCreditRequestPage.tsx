import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { CreditRequestForm } from './CreditRequestForm'
import { creditRequestsApi } from './creditRequestsApi'
import {
  toCreditRequestFormValues,
  toUpdateCreditRequestInput,
} from './mapCreditRequestForm'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import type { CreditRequestFormValues } from '../../schemas/credit-request.schema'

export function EditCreditRequestPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const { data: creditRequest, isLoading } = useQuery({
    queryKey: ['credit-request', id],
    queryFn: () => creditRequestsApi.get(id!),
    enabled: Boolean(id),
  })

  const mutation = useMutation({
    mutationFn: (values: CreditRequestFormValues) =>
      creditRequestsApi.update(id!, toUpdateCreditRequestInput(values)),
    onSuccess: () => {
      showSuccess('Solicitação atualizada com sucesso.')
      navigate(`/credit-requests/${id}`)
    },
    onError: (error: unknown) => {
      showError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar a solicitação.',
      )
    },
  })

  if (isLoading) return <Spinner />
  if (!creditRequest) return null

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Editar Solicitação de Crédito</CardTitle>
      </CardHeader>
      <CreditRequestForm
        onSubmit={(values) => mutation.mutateAsync(values)}
        isSubmitting={mutation.isPending}
        defaultValues={toCreditRequestFormValues(creditRequest)}
      />
    </Card>
  )
}
