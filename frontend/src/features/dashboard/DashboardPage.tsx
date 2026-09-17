import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { creditRequestsApi } from '../credit-requests/creditRequestsApi'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { buttonVariants } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn } from '../../lib/cn'
import {
  CREDIT_REQUEST_STATUS_LABELS,
  CREDIT_REQUEST_STATUS_VARIANT,
  formatCurrency,
  formatDateTime,
} from '../../lib/labels'
import type { CreditRequest } from '../../types/credit-request'
import type { CreditRequestStatus } from '../../types/credit-request-status'
import type { Role } from '../../types/role'

const QUEUE_STATUSES: Partial<Record<Role, CreditRequestStatus[]>> = {
  GERENTE: ['SUBMITTED_TO_MANAGER', 'MANAGER_REVIEW', 'RETURNED_TO_MANAGER'],
  CREDITO: ['SUBMITTED_TO_CREDIT', 'CREDIT_REVIEW'],
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['credit-requests'],
    queryFn: () => creditRequestsApi.list(),
  })

  const statuses = user ? QUEUE_STATUSES[user.role] : undefined
  const creditRequests =
    data?.data.filter((cr) => !statuses || statuses.includes(cr.status)) ?? []

  const title =
    user?.role === 'CONSULTOR' ? 'Minhas Solicitações' : 'Fila de Análise'
  const canCreate = user?.role === 'CONSULTOR' || user?.role === 'ADMIN'
  // GERENTE nunca vê o valor solicitado — some a coluna inteira em vez de
  // deixar um traço em toda linha. Para o CONSULTOR varia por linha (some só
  // depois do envio), então a coluna fica e cada célula decide por status.
  const showValueColumn = user?.role !== 'GERENTE'
  // GERENTE só enxerga a própria filial (o backend já filtra), então basta
  // agrupar por consultor. CRÉDITO enxerga todas as filiais, então agrupa
  // primeiro por filial e depois por consultor dentro dela.
  const groupByConsultant = user?.role === 'GERENTE' || user?.role === 'CREDITO'
  const groupByBranch = user?.role === 'CREDITO'

  return (
    <Card>
      <CardHeader tone="brand">
        <CardTitle className="text-white">{title}</CardTitle>
        {canCreate && (
          <Link
            to="/clients/new"
            className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }))}
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo Cadastro e Solicitação
          </Link>
        )}
      </CardHeader>

      {isLoading ? (
        <Spinner />
      ) : creditRequests.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitação por aqui"
          description={
            user?.role === 'CONSULTOR'
              ? 'Cadastre um cliente e crie uma solicitação de crédito para começar.'
              : 'Não há solicitações aguardando sua análise no momento.'
          }
        />
      ) : groupByConsultant ? (
        <ConsultantGroupedView
          creditRequests={creditRequests}
          groupByBranch={groupByBranch}
          showValueColumn={showValueColumn}
        />
      ) : (
        <CreditRequestsTable
          creditRequests={creditRequests}
          showValueColumn={showValueColumn}
          hideValueForConsultorInProgress={user?.role === 'CONSULTOR'}
        />
      )}
    </Card>
  )
}

function ConsultantGroupedView({
  creditRequests,
  groupByBranch,
  showValueColumn,
}: {
  creditRequests: CreditRequest[]
  groupByBranch: boolean
  showValueColumn: boolean
}) {
  const byConsultant = new Map<
    string,
    { name: string; branchName: string | null; requests: CreditRequest[] }
  >()

  for (const creditRequest of creditRequests) {
    const consultantId = creditRequest.consultant?.id ?? creditRequest.consultantId
    const existing = byConsultant.get(consultantId)
    if (existing) {
      existing.requests.push(creditRequest)
    } else {
      byConsultant.set(consultantId, {
        name: creditRequest.consultant?.name ?? 'Consultor',
        branchName: creditRequest.consultant?.branch?.name ?? null,
        requests: [creditRequest],
      })
    }
  }

  if (!groupByBranch) {
    return (
      <div className="flex flex-col gap-4">
        {[...byConsultant.entries()].map(([consultantId, group]) => (
          <ConsultantCard
            key={consultantId}
            name={group.name}
            requests={group.requests}
            showValueColumn={showValueColumn}
          />
        ))}
      </div>
    )
  }

  const byBranch = new Map<
    string,
    Map<string, { name: string; requests: CreditRequest[] }>
  >()

  for (const [consultantId, group] of byConsultant) {
    const branchName = group.branchName ?? 'Sem filial'
    const branchGroup = byBranch.get(branchName) ?? new Map()
    branchGroup.set(consultantId, { name: group.name, requests: group.requests })
    byBranch.set(branchName, branchGroup)
  }

  return (
    <div className="flex flex-col gap-6">
      {[...byBranch.entries()].map(([branchName, consultants]) => (
        <div key={branchName}>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {branchName}
          </h3>
          <div className="flex flex-col gap-4">
            {[...consultants.entries()].map(([consultantId, group]) => (
              <ConsultantCard
                key={consultantId}
                name={group.name}
                requests={group.requests}
                showValueColumn={showValueColumn}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ConsultantCard({
  name,
  requests,
  showValueColumn,
}: {
  name: string
  requests: CreditRequest[]
  showValueColumn: boolean
}) {
  return (
    <div className="rounded-lg border border-slate-200">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2">
        <span className="text-sm font-semibold text-slate-800">{name}</span>
        <span className="text-xs text-slate-500">
          {requests.length}{' '}
          {requests.length === 1 ? 'solicitação' : 'solicitações'}
        </span>
      </div>
      <div className="px-4 py-2">
        <CreditRequestsTable
          creditRequests={requests}
          showValueColumn={showValueColumn}
        />
      </div>
    </div>
  )
}

function CreditRequestsTable({
  creditRequests,
  showValueColumn,
  hideValueForConsultorInProgress = false,
}: {
  creditRequests: CreditRequest[]
  showValueColumn: boolean
  hideValueForConsultorInProgress?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            {showValueColumn && (
              <th className="py-2 font-medium">Valor solicitado</th>
            )}
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Criada em</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {creditRequests.map((creditRequest) => (
            <tr
              key={creditRequest.id}
              className="border-b border-slate-100 last:border-0"
            >
              {showValueColumn && (
                <td className="py-2 text-slate-900">
                  {hideValueForConsultorInProgress &&
                  creditRequest.status !== 'DRAFT'
                    ? '—'
                    : formatCurrency(creditRequest.requestedCreditLimit)}
                </td>
              )}
              <td className="py-2">
                <Badge
                  variant={CREDIT_REQUEST_STATUS_VARIANT[creditRequest.status]}
                >
                  {CREDIT_REQUEST_STATUS_LABELS[creditRequest.status]}
                </Badge>
              </td>
              <td className="py-2 text-slate-600">
                {formatDateTime(creditRequest.createdAt)}
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
  )
}
