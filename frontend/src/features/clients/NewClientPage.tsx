import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClientFieldsSection } from './ClientFieldsSection'
import { PartnersSection } from './PartnersSection'
import { CreditRequestFieldsSection } from '../credit-requests/CreditRequestFieldsSection'
import { PropertiesSection } from '../properties/PropertiesSection'
import { clientsApi } from './clientsApi'
import { partnersApi } from './partnersApi'
import { propertiesApi } from '../properties/propertiesApi'
import { productionApi } from '../properties/productionApi'
import { creditRequestsApi } from '../credit-requests/creditRequestsApi'
import { toCreatePropertyInput } from '../properties/mapPropertyForm'
import { toCreateCreditRequestInput } from '../credit-requests/mapCreditRequestForm'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { newClientRequestSchema } from '../../schemas/new-client-request.schema'
import type { NewClientRequestFormValues } from '../../schemas/new-client-request.schema'

const DEFAULT_VALUES: NewClientRequestFormValues = {
  client: {
    name: '',
    document: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    hasEasyRegistrationInfo: false,
    timeInBusiness: 'MORE_THAN_10_YEARS',
    hasCommercialReference: false,
  },
  partners: [],
  properties: [
    {
      name: '',
      city: '',
      state: '',
      region: '',
      ownAreaHectares: '',
      leasedAreaHectares: '',
      irrigatedAreaHectares: '',
      productions: [],
    },
  ],
  creditRequest: {
    requestedCreditLimit: '',
    leasedAreaPlanting: false,
    firstHarvestAreaPlanting: false,
    barterModality: false,
    hasRenegotiatedDebts: false,
    landAcquisition: false,
    newMachineryAcquisition: false,
    otherActivity: false,
  },
}

export function NewClientPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const methods = useForm<NewClientRequestFormValues>({
    resolver: zodResolver(newClientRequestSchema),
    defaultValues: DEFAULT_VALUES,
  })

  async function onSubmit(values: NewClientRequestFormValues) {
    setIsSubmitting(true)
    let clientId: string | undefined
    try {
      const client = await clientsApi.create(values.client)
      clientId = client.id

      for (const partner of values.partners) {
        await partnersApi.create(client.id, partner)
      }

      for (const property of values.properties) {
        const { productions, ...propertyFields } = property
        const createdProperty = await propertiesApi.create(
          toCreatePropertyInput(propertyFields, client.id),
        )
        for (const production of productions) {
          await productionApi.create(createdProperty.id, production)
        }
      }

      const creditRequest = await creditRequestsApi.create(
        toCreateCreditRequestInput(values.creditRequest, client.id),
      )

      showSuccess('Cliente e solicitação de crédito cadastrados com sucesso.')
      navigate(`/credit-requests/${creditRequest.id}`)
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Não foi possível concluir o cadastro.'
      showError(message)
      if (clientId) {
        navigate(`/clients/${clientId}`)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(e) => void methods.handleSubmit(onSubmit)(e)}
        className="flex flex-col gap-6"
        noValidate
      >
        <Card>
          <CardHeader>
            <CardTitle>1 — Dados do Cliente</CardTitle>
          </CardHeader>
          <ClientFieldsSection />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sócios</CardTitle>
          </CardHeader>
          <PartnersSection />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2 — Solicitação e Análise Inicial</CardTitle>
          </CardHeader>
          <CreditRequestFieldsSection />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3 — Fazendas e Produção</CardTitle>
          </CardHeader>
          <PropertiesSection />
        </Card>

        <Button type="submit" isLoading={isSubmitting} className="self-start">
          Salvar cadastro e solicitação
        </Button>
      </form>
    </FormProvider>
  )
}
