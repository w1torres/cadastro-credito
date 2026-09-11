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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {canCreate && (
          <Link
            to="/clients/new"
            className={cn(buttonVariants({ size: 'sm' }))}
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
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 font-medium">Valor solicitado</th>
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
      )}
    </Card>
  )
}
