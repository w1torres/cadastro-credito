import type { ReactNode } from 'react'
import { useFormContext } from 'react-hook-form'
import { TIME_IN_BUSINESS_LABELS, formatCurrency } from '../../lib/labels'
import type { NewClientRequestFormValues } from '../../schemas/new-client-request.schema'

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-sm text-slate-900">{value || value === 0 ? value : '—'}</dd>
    </div>
  )
}

function ReviewCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2">
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

const CREDIT_REQUEST_FLAGS: Array<{
  key: keyof NewClientRequestFormValues['creditRequest']
  label: string
}> = [
  { key: 'leasedAreaPlanting', label: 'Plantio em área arrendada' },
  { key: 'firstHarvestAreaPlanting', label: 'Plantio de primeira safra na área' },
  { key: 'barterModality', label: 'Modalidade de troca (barter)' },
  { key: 'hasRenegotiatedDebts', label: 'Possui dívidas renegociadas' },
  { key: 'landAcquisition', label: 'Aquisição de terras' },
  { key: 'newMachineryAcquisition', label: 'Aquisição de maquinário novo' },
  { key: 'otherActivity', label: 'Outra atividade relevante' },
]

/** Resumo somente-leitura de tudo o que foi preenchido, para conferência antes do envio final. */
export function ReviewSection({
  confirmationHint = 'Confira os dados abaixo antes de enviar. Para corrigir algo, use o botão "Voltar".',
}: {
  confirmationHint?: string
}) {
  const { watch } = useFormContext<NewClientRequestFormValues>()
  const values = watch()
  const { client, partners, creditRequest, properties } = values

  const activeFlags = CREDIT_REQUEST_FLAGS.filter(({ key }) => creditRequest[key])

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">{confirmationHint}</p>

      <ReviewCard title="Dados do Cliente">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome / Razão social" value={client.name} />
          <Field label="CPF / CNPJ" value={client.document} />
          <Field label="Telefone" value={client.phone} />
          <Field label="E-mail" value={client.email} />
          <Field label="Endereço" value={client.address} />
          <Field label="Município/UF" value={client.city ? `${client.city}/${client.state}` : ''} />
          <Field label="CEP" value={client.zipCode} />
          <Field
            label="Tempo de atividade"
            value={
              client.timeInBusiness
                ? TIME_IN_BUSINESS_LABELS[client.timeInBusiness]
                : undefined
            }
          />
        </dl>
        {partners.length > 0 && (
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
              Sócios ({partners.length})
            </p>
            <ul className="flex flex-col gap-1 text-sm text-slate-700">
              {partners.map((partner, index) => (
                <li key={index}>
                  {partner.name} — {partner.document}
                </li>
              ))}
            </ul>
          </div>
        )}
      </ReviewCard>

      <ReviewCard title="Solicitação de Crédito">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Field
            label="Valor solicitado"
            value={
              creditRequest.requestedCreditLimit
                ? formatCurrency(creditRequest.requestedCreditLimit)
                : undefined
            }
          />
        </dl>
        {activeFlags.length > 0 && (
          <ul className="mt-3 flex flex-col gap-1 text-sm text-slate-700">
            {activeFlags.map(({ key, label }) => (
              <li key={key}>• {label}</li>
            ))}
          </ul>
        )}
      </ReviewCard>

      <ReviewCard title={`Fazendas e Produção (${properties.length})`}>
        <div className="flex flex-col gap-4">
          {properties.map((property, index) => (
            <div
              key={index}
              className="rounded-md bg-slate-50 p-3 last:mb-0"
            >
              <p className="mb-2 text-sm font-semibold text-slate-800">
                {property.name || `Fazenda ${index + 1}`}
              </p>
              <dl className="grid gap-3 sm:grid-cols-3">
                <Field label="Município/UF" value={property.city ? `${property.city}/${property.state}` : ''} />
                <Field label="Região" value={property.region} />
                <Field label="Área própria (ha)" value={property.ownAreaHectares} />
                <Field label="Área arrendada (ha)" value={property.leasedAreaHectares} />
                <Field label="Área irrigada (ha)" value={property.irrigatedAreaHectares} />
              </dl>
              {property.productions.length > 0 && (
                <p className="mt-2 text-xs text-slate-600">
                  Culturas:{' '}
                  {property.productions
                    .map((p) => `${p.cropName} (${p.hectares} ha, ${p.harvestYear})`)
                    .join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </ReviewCard>
    </div>
  )
}
