import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowRight, Save } from 'lucide-react'
import { ClientFieldsSection } from '../clients/ClientFieldsSection'
import { PartnersSection } from '../clients/PartnersSection'
import { ReviewSection } from '../clients/ReviewSection'
import { CreditRequestFieldsSection } from './CreditRequestFieldsSection'
import { PropertiesSection } from '../properties/PropertiesSection'
import { DocumentsSection } from '../documents/DocumentsSection'
import { SignatureSection } from '../signatures/SignatureSection'
import { clientsApi } from '../clients/clientsApi'
import { partnersApi } from '../clients/partnersApi'
import { propertiesApi } from '../properties/propertiesApi'
import { productionApi } from '../properties/productionApi'
import { creditRequestsApi } from './creditRequestsApi'
import { useAuth } from '../auth/AuthContext'
import {
  toCreatePropertyInput,
  toUpdatePropertyInput,
} from '../properties/mapPropertyForm'
import { toUpdateCreditRequestInput } from './mapCreditRequestForm'
import { toEditClientRequestFormValues } from '../clients/mapEditClientRequestForm'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Stepper } from '../../components/ui/Stepper'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { editClientRequestSchema } from '../../schemas/edit-client-request.schema'
import type { EditClientRequestFormValues } from '../../schemas/edit-client-request.schema'
import type { Client } from '../../types/client'
import type { Property } from '../../types/property'
import type { CreditRequest } from '../../types/credit-request'
import type { Path } from 'react-hook-form'

const EDITABLE_STATUSES = ['DRAFT', 'RETURNED_TO_CONSULTANT']

interface WizardStep {
  label: string
  fields: Path<EditClientRequestFormValues>[]
}

const STEPS: WizardStep[] = [
  { label: 'Dados do Cliente', fields: ['client', 'partners'] },
  { label: 'Solicitação de Crédito', fields: ['creditRequest'] },
  { label: 'Fazendas e Produção', fields: ['properties'] },
  { label: 'Documentos e Anexos', fields: [] },
  { label: 'Assinatura', fields: [] },
  { label: 'Revisão e Envio', fields: [] },
]

export function EditClientRequestPage() {
  const { id } = useParams<{ id: string }>()

  const { data: creditRequest, isLoading: isLoadingCreditRequest } = useQuery({
    queryKey: ['credit-request', id],
    queryFn: () => creditRequestsApi.get(id!),
    enabled: Boolean(id),
  })
  const { data: client, isLoading: isLoadingClient } = useQuery({
    queryKey: ['client', creditRequest?.clientId],
    queryFn: () => clientsApi.get(creditRequest!.clientId),
    enabled: Boolean(creditRequest),
  })
  const { data: propertiesResult, isLoading: isLoadingProperties } = useQuery({
    queryKey: ['properties', creditRequest?.clientId],
    queryFn: () => propertiesApi.listByClient(creditRequest!.clientId),
    enabled: Boolean(creditRequest),
  })

  if (isLoadingCreditRequest || isLoadingClient || isLoadingProperties) {
    return <Spinner />
  }
  if (!id || !creditRequest || !client || !propertiesResult) {
    return <EmptyState title="Solicitação não encontrada" />
  }
  if (!EDITABLE_STATUSES.includes(creditRequest.status)) {
    return (
      <EmptyState
        title="Esta solicitação não pode mais ser editada"
        description="Somente solicitações em rascunho ou devolvidas para correção podem ser editadas."
      />
    )
  }

  return (
    <EditWizard
      creditRequestId={id}
      client={client}
      properties={propertiesResult.data}
      creditRequest={creditRequest}
    />
  )
}

function EditWizard({
  creditRequestId,
  client,
  properties,
  creditRequest,
}: {
  creditRequestId: string
  client: Client
  properties: Property[]
  creditRequest: CreditRequest
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(0)

  // Mesma regra de "quem pode editar" do resto do app (ver CreditRequestDetailPage):
  // dono CONSULTOR ou ADMIN. Um GERENTE que abra esta URL (visível a ele por
  // estar na mesma filial) só vê Documentos/Assinatura em modo leitura.
  const canEditDocuments =
    !!user && (user.role === 'ADMIN' || creditRequest.consultantId === user.id)

  const methods = useForm<EditClientRequestFormValues>({
    resolver: zodResolver(editClientRequestSchema),
    defaultValues: toEditClientRequestFormValues(
      client,
      properties,
      creditRequest,
    ),
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

  async function onSubmit(values: EditClientRequestFormValues) {
    setIsSubmitting(true)
    try {
      await clientsApi.update(client.id, values.client)

      const originalPartnerIds = new Set(
        (client.partners ?? []).map((partner) => partner.id),
      )
      const submittedPartnerIds = new Set(
        values.partners.filter((partner) => partner.id).map((p) => p.id!),
      )
      for (const partner of values.partners) {
        const { id: partnerId, ...fields } = partner
        if (partnerId) {
          await partnersApi.update(partnerId, fields)
        } else {
          await partnersApi.create(client.id, fields)
        }
      }
      for (const originalId of originalPartnerIds) {
        if (!submittedPartnerIds.has(originalId)) {
          await partnersApi.remove(originalId)
        }
      }

      const originalProductionsByProperty = new Map(
        properties.map((property) => [property.id, property.productions ?? []]),
      )

      for (const property of values.properties) {
        const { id: propertyId, productions, ...propertyFields } = property
        let resolvedPropertyId = propertyId

        if (propertyId) {
          await propertiesApi.update(
            propertyId,
            toUpdatePropertyInput(propertyFields),
          )
        } else {
          const created = await propertiesApi.create(
            toCreatePropertyInput(propertyFields, client.id),
          )
          resolvedPropertyId = created.id
        }

        const originalProductions = propertyId
          ? (originalProductionsByProperty.get(propertyId) ?? [])
          : []
        const originalProductionIds = new Set(
          originalProductions.map((production) => production.id),
        )
        const submittedProductionIds = new Set(
          productions
            .filter((production) => production.id)
            .map((production) => production.id!),
        )

        for (const production of productions) {
          const { id: productionId, ...productionFields } = production
          if (productionId) {
            await productionApi.update(productionId, productionFields)
          } else {
            await productionApi.create(resolvedPropertyId!, productionFields)
          }
        }
        for (const originalId of originalProductionIds) {
          if (!submittedProductionIds.has(originalId)) {
            await productionApi.remove(originalId)
          }
        }
      }

      await creditRequestsApi.update(
        creditRequestId,
        toUpdateCreditRequestInput(values.creditRequest),
      )

      void queryClient.invalidateQueries({
        queryKey: ['credit-request', creditRequestId],
      })
      void queryClient.invalidateQueries({ queryKey: ['credit-requests'] })
      void queryClient.invalidateQueries({ queryKey: ['client', client.id] })
      void queryClient.invalidateQueries({ queryKey: ['clients'] })
      void queryClient.invalidateQueries({
        queryKey: ['properties', client.id],
      })

      showSuccess('Solicitação atualizada com sucesso.')
      navigate(`/credit-requests/${creditRequestId}`)
    } catch (error) {
      showError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar as alterações.',
      )
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
                  <CardTitle className="text-white">
                    1 — Dados do Cliente
                  </CardTitle>
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
                <CardTitle className="text-white">
                  2 — Solicitação e Análise Inicial
                </CardTitle>
              </CardHeader>
              <CreditRequestFieldsSection />
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader tone="brand">
                <CardTitle className="text-white">
                  3 — Fazendas e Produção
                </CardTitle>
              </CardHeader>
              <PropertiesSection />
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader tone="brand">
                <CardTitle className="text-white">
                  4 — Documentos e Anexos
                </CardTitle>
              </CardHeader>
              <DocumentsSection
                creditRequestId={creditRequestId}
                canEdit={canEditDocuments}
              />
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader tone="brand">
                <CardTitle className="text-white">5 — Assinatura</CardTitle>
              </CardHeader>
              <SignatureSection
                creditRequestId={creditRequestId}
                canRequest={canEditDocuments}
              />
            </Card>
          )}

          {step === 5 && (
            <Card>
              <CardHeader tone="brand">
                <CardTitle className="text-white">
                  6 — Revisão e Envio
                </CardTitle>
              </CardHeader>
              <ReviewSection confirmationHint='Confira os dados abaixo antes de salvar. Para corrigir algo, use o botão "Voltar".' />
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
                <Save className="size-4" aria-hidden="true" />
                Salvar Alterações
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
