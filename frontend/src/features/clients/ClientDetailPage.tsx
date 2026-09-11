import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { clientsApi } from './clientsApi'
import { propertiesApi } from '../properties/propertiesApi'
import { creditRequestsApi } from '../credit-requests/creditRequestsApi'
import { useAuth } from '../auth/AuthContext'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { buttonVariants } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn } from '../../lib/cn'
import {
  CREDIT_REQUEST_STATUS_LABELS,
  CREDIT_REQUEST_STATUS_VARIANT,
  TIME_IN_BUSINESS_LABELS,
  formatCurrency,
} from '../../lib/labels'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const canManage = user?.role === 'CONSULTOR' || user?.role === 'ADMIN'

  const clientQuery = useQuery({
    queryKey: ['client', id],
    queryFn: () => clientsApi.get(id!),
    enabled: Boolean(id),
  })
  const propertiesQuery = useQuery({
    queryKey: ['properties', id],
    queryFn: () => propertiesApi.listByClient(id!),
    enabled: Boolean(id),
  })
  const creditRequestsQuery = useQuery({
    queryKey: ['credit-requests', { clientId: id }],
    queryFn: () => creditRequestsApi.list({ clientId: id }),
    enabled: Boolean(id),
  })

  if (clientQuery.isLoading) return <Spinner />
  const client = clientQuery.data
  if (!client) return <EmptyState title="Cliente não encontrado" />

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{client.name}</CardTitle>
        </CardHeader>
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Documento</dt>
            <dd className="text-slate-900">{client.document}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Telefone</dt>
            <dd className="text-slate-900">{client.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-500">E-mail</dt>
            <dd className="text-slate-900">{client.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Cidade/UF</dt>
            <dd className="text-slate-900">
              {client.city}/{client.state}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Tempo de atividade</dt>
            <dd className="text-slate-900">
              {TIME_IN_BUSINESS_LABELS[client.timeInBusiness]}
            </dd>
          </div>
          {client.spouseName && (
            <div>
              <dt className="text-slate-500">Cônjuge</dt>
              <dd className="text-slate-900">{client.spouseName}</dd>
            </div>
          )}
        </dl>
      </Card>

      {client.partners && client.partners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sócios</CardTitle>
          </CardHeader>
          <ul className="flex flex-col gap-2 text-sm">
            {client.partners.map((partner) => (
              <li
                key={partner.id}
                className="border-b border-slate-100 pb-2 last:border-0"
              >
                <span className="font-medium text-slate-900">
                  {partner.name}
                </span>
                <span className="text-slate-500">
                  {' '}
                  — {partner.document} · {partner.phone}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Propriedades</CardTitle>
          {canManage && (
            <Link
              to={`/clients/${client.id}/properties/new`}
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nova Propriedade
            </Link>
          )}
        </CardHeader>
        {propertiesQuery.isLoading ? (
          <Spinner />
        ) : !propertiesQuery.data || propertiesQuery.data.data.length === 0 ? (
          <EmptyState title="Nenhuma propriedade cadastrada" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 font-medium">Nome</th>
                  <th className="py-2 font-medium">Cidade/UF</th>
                  <th className="py-2 font-medium">Área própria (ha)</th>
                </tr>
              </thead>
              <tbody>
                {propertiesQuery.data.data.map((property) => (
                  <tr
                    key={property.id}
                    className="border-b border-slate-100 last:border-0 align-top"
                  >
                    <td className="py-2 font-medium text-slate-900">
                      {property.name}
                    </td>
                    <td className="py-2 text-slate-600">
                      {property.city}/{property.state}
                    </td>
                    <td className="py-2 text-slate-600">
                      {property.ownAreaHectares}
                      {property.productions &&
                        property.productions.length > 0 && (
                          <ul className="mt-1 text-xs text-slate-500">
                            {property.productions.map((production) => (
                              <li key={production.id}>
                                {production.harvestYear} — {production.cropName}
                                : {production.hectares} ha
                              </li>
                            ))}
                          </ul>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações de Crédito</CardTitle>
          {canManage && (
            <Link
              to={`/clients/${client.id}/credit-requests/new`}
              className={cn(buttonVariants({ size: 'sm' }))}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nova Solicitação
            </Link>
          )}
        </CardHeader>
        {creditRequestsQuery.isLoading ? (
          <Spinner />
        ) : !creditRequestsQuery.data ||
          creditRequestsQuery.data.data.length === 0 ? (
          <EmptyState title="Nenhuma solicitação de crédito" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 font-medium">Valor solicitado</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {creditRequestsQuery.data.data.map((creditRequest) => (
                  <tr
                    key={creditRequest.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="py-2 text-slate-900">
                      {formatCurrency(creditRequest.requestedCreditLimit)}
                    </td>
                    <td className="py-2">
                      <Badge
                        variant={
                          CREDIT_REQUEST_STATUS_VARIANT[creditRequest.status]
                        }
                      >
                        {CREDIT_REQUEST_STATUS_LABELS[creditRequest.status]}
                      </Badge>
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        to={`/credit-requests/${creditRequest.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
