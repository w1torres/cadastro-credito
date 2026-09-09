import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { ClientForm } from './ClientForm'
import { clientsApi } from './clientsApi'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import type { ClientFormValues } from '../../schemas/client.schema'
import type { CreateClientInput } from '../../types/client'

export function NewClientPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const mutation = useMutation({
    mutationFn: (values: CreateClientInput) => clientsApi.create(values),
    onSuccess: (client) => {
      showSuccess('Cliente cadastrado com sucesso.')
      navigate(`/clients/${client.id}`)
    },
    onError: (error: unknown) => {
      showError(error instanceof ApiError ? error.message : 'Não foi possível salvar o cliente.')
    },
  })

  function handleSubmit(values: ClientFormValues) {
    const payload: CreateClientInput = {
      ...values,
      spouseName: values.spouseName || undefined,
      relevantInfo: values.relevantInfo || undefined,
      commercialReferenceNotes: values.commercialReferenceNotes || undefined,
    }
    return mutation.mutateAsync(payload)
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader>
        <CardTitle>Novo Cliente</CardTitle>
      </CardHeader>
      <ClientForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
    </Card>
  )
}
