import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { PropertyForm } from './PropertyForm'
import { propertiesApi } from './propertiesApi'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import type { PropertyFormValues } from '../../schemas/property.schema'
import type { CreatePropertyInput } from '../../types/property'

export function NewPropertyPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()

  const mutation = useMutation({
    mutationFn: (values: CreatePropertyInput) => propertiesApi.create(values),
    onSuccess: () => {
      showSuccess('Propriedade cadastrada com sucesso.')
      navigate(`/clients/${clientId}`)
    },
    onError: (error: unknown) => {
      showError(error instanceof ApiError ? error.message : 'Não foi possível salvar a propriedade.')
    },
  })

  function handleSubmit(values: PropertyFormValues) {
    if (!clientId) return Promise.resolve()
    const payload: CreatePropertyInput = {
      ...values,
      clientId,
      stateRegistration: values.stateRegistration || undefined,
      latitude: values.latitude || undefined,
      longitude: values.longitude || undefined,
    }
    return mutation.mutateAsync(payload)
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Nova Propriedade</CardTitle>
      </CardHeader>
      <PropertyForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
    </Card>
  )
}
