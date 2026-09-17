import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { ClientFieldsSection } from './ClientFieldsSection'
import { PartnersSection } from './PartnersSection'
import { ReviewSection } from './ReviewSection'
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
import { Stepper } from '../../components/ui/Stepper'
import { newClientRequestSchema } from '../../schemas/new-client-request.schema'
import type { NewClientRequestFormValues } from '../../schemas/new-client-request.schema'
import type { Path } from 'react-hook-form'

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

interface WizardStep {
  label: string
  fields: Path<NewClientRequestFormValues>[]
}

const STEPS: WizardStep[] = [
  { label: 'Dados do Cliente', fields: ['client', 'partners'] },
  { label: 'Solicitação de Crédito', fields: ['creditRequest'] },
  { label: 'Fazendas e Produção', fields: ['properties'] },
  { label: 'Revisão e Envio', fields: [] },
]

export function NewClientPage() {
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(0)
  const methods = useForm<NewClientRequestFormValues>({
    resolver: zodResolver(newClientRequestSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const isFirstStep = step === 0
  const isLastStep = step === STEPS.length - 1

  async function handleNext() {
    const fieldsToValidate = STEPS[step].fields
    const valid =
      fieldsToValidate.length === 0
        ? true
        : await methods.trigger(fieldsToValidate)
    if (valid) setStep((current) => Math.min(current + 1, STEPS.length - 1))
  }

  function handleBack() {
    setStep((current) => Math.max(current - 1, 0))
  }

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
      <div className="flex flex-col gap-6">
        <Card>
          <Stepper
            steps={STEPS.map((s) => ({ label: s.label }))}
            currentStep={step}
          />
        </Card>

        <form
          onSubmit={(e) => void methods.handleSubmit(onSubmit)(e)}
          className="flex flex-col gap-6"
          noValidate
        >
          {step === 0 && (
            <>
              <Card>
                <CardHeader tone="brand">
                  <CardTitle className="text-white">1 — Dados do Cliente</CardTitle>
                </CardHeader>
                <ClientFieldsSection />
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sócios</CardTitle>
                </CardHeader>
                <PartnersSection />
              </Card>
            </>
          )}

          {step === 1 && (
            <Card>
              <CardHeader tone="brand">
                <CardTitle className="text-white">2 — Solicitação e Análise Inicial</CardTitle>
              </CardHeader>
              <CreditRequestFieldsSection />
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader tone="brand">
                <CardTitle className="text-white">3 — Fazendas e Produção</CardTitle>
              </CardHeader>
              <PropertiesSection />
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader tone="brand">
                <CardTitle className="text-white">4 — Revisão e Envio</CardTitle>
              </CardHeader>
              <ReviewSection />
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              disabled={isFirstStep || isSubmitting}
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Voltar
            </Button>

            {isLastStep ? (
              <Button
                type="button"
                isLoading={isSubmitting}
                onClick={() => void methods.handleSubmit(onSubmit)()}
              >
                <Send className="size-4" aria-hidden="true" />
                Enviar Solicitação
              </Button>
            ) : (
              <Button type="button" onClick={() => void handleNext()}>
                Próxima Etapa
                <ArrowRight className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  )
}
