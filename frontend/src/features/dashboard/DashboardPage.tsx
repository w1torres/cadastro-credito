import { useMemo, useState } from 'react'
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

function comparaOrdenacao(
  ordenacao: 'data_recente' | 'data_antiga' | 'valor_maior' | 'valor_menor',
) {
  return (a: CreditRequest, b: CreditRequest) => {
    if (ordenacao === 'valor_maior')
      return Number(b.requestedCreditLimit) - Number(a.requestedCreditLimit)
    if (ordenacao === 'valor_menor')
      return Number(a.requestedCreditLimit) - Number(b.requestedCreditLimit)
    const diff = Date.parse(a.createdAt) - Date.parse(b.createdAt)
    return ordenacao === 'data_antiga' ? diff : -diff
  }
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['credit-requests'],
    queryFn: () => creditRequestsApi.list(),
  })

  const statuses = user ? QUEUE_STATUSES[user.role] : undefined
  const filaBase = useMemo(
    () =>
      data?.data.filter((cr) => !statuses || statuses.includes(cr.status)) ??
      [],
    [data, statuses],
  )

  // Filtros da fila (crédito e gerente). '' = todos.
  const [filialFiltro, setFilialFiltro] = useState('')
  const [consultorFiltro, setConsultorFiltro] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('')
  // Filtros de período e valor (crédito). Strings vazias = sem limite.
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [valorMin, setValorMin] = useState('')
  const [valorMax, setValorMax] = useState('')
  // Ordenação da fila (crédito): data de criação ou valor solicitado.
  const [ordenacao, setOrdenacao] = useState<
    'data_recente' | 'data_antiga' | 'valor_maior' | 'valor_menor'
  >('data_recente')
  const isGestor = user?.role === 'CREDITO' || user?.role === 'GERENTE'

  const filiaisDisponiveis = useMemo(() => {
    const nomes = new Set<string>()
    filaBase.forEach((cr) => {
      if (cr.consultant?.branch?.name) nomes.add(cr.consultant.branch.name)
    })
    return [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [filaBase])

  const consultoresDisponiveis = useMemo(() => {
    const mapa = new Map<
      string,
      { id: string; name: string; branch: string | null }
    >()
    filaBase.forEach((cr) => {
      const id = cr.consultant?.id ?? cr.consultantId
      if (!mapa.has(id)) {
        mapa.set(id, {
          id,
          name: cr.consultant?.name ?? 'Consultor',
          branch: cr.consultant?.branch?.name ?? null,
        })
      }
    })
    return [...mapa.values()]
      .filter((c) => !filialFiltro || c.branch === filialFiltro)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [filaBase, filialFiltro])

  const statusesDisponiveis = useMemo(
    () => [...new Set(filaBase.map((cr) => cr.status))],
    [filaBase],
  )

  const creditRequests = useMemo(
    () =>
      [
        ...filaBase.filter((cr) => {
          const branch = cr.consultant?.branch?.name ?? null
          if (filialFiltro && branch !== filialFiltro) return false
          if (
            consultorFiltro &&
            (cr.consultant?.id ?? cr.consultantId) !== consultorFiltro
          )
            return false
          if (statusFiltro && cr.status !== statusFiltro) return false
          const criada = Date.parse(cr.createdAt)
          if (
            dataInicio &&
            criada < new Date(`${dataInicio}T00:00:00`).getTime()
          )
            return false
          if (dataFim && criada > new Date(`${dataFim}T23:59:59.999`).getTime())
            return false
          const valor = Number(cr.requestedCreditLimit)
          if (valorMin !== '' && valor < Number(valorMin)) return false
          if (valorMax !== '' && valor > Number(valorMax)) return false
          return true
        }),
      ].sort(comparaOrdenacao(ordenacao)),
    [
      filaBase,
      filialFiltro,
      consultorFiltro,
      statusFiltro,
      dataInicio,
      dataFim,
      valorMin,
      valorMax,
      ordenacao,
    ],
  )

  // Se o consultor escolhido não pertence mais à filial selecionada, limpa a escolha.
  const consultorValido = consultoresDisponiveis.some(
    (c) => c.id === consultorFiltro,
  )
  if (consultorFiltro && !consultorValido) {
    setConsultorFiltro('')
  }

  const title =
    user?.role === 'CONSULTOR' ? 'Minhas Solicitações' : 'Fila de Análise'
  const canCreate = user?.role === 'CONSULTOR' || user?.role === 'ADMIN'
  // GERENTE nunca vê o valor solicitado — some a coluna inteira em vez de
  // deixar um traço em toda linha. Para o CONSULTOR varia por linha (some só
  // depois do envio), então a coluna fica e cada célula decide por status.
  // CONSULTOR também não vê o valor na lista: a visão dele mostra só o status (pendências/ficha) e a data.
  const showValueColumn = user?.role !== 'GERENTE' && user?.role !== 'CONSULTOR'
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

      {isGestor && (
        <div className="flex flex-wrap items-end gap-3 border-b border-slate-200 p-4">
          {user?.role === 'CREDITO' && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-600">Filial</span>
              <select
                value={filialFiltro}
                onChange={(e) => {
                  setFilialFiltro(e.target.value)
                  setConsultorFiltro('')
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                <option value="">Todas as filiais</option>
                {filiaisDisponiveis.map((nome) => (
                  <option key={nome} value={nome}>
                    {nome}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Consultor</span>
            <select
              value={consultorFiltro}
              onChange={(e) => setConsultorFiltro(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">Todos os consultores</option>
              {consultoresDisponiveis.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Status</span>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2"
            >
              <option value="">Todos os status</option>
              {statusesDisponiveis.map((status) => (
                <option key={status} value={status}>
                  {CREDIT_REQUEST_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
          {user?.role === 'CREDITO' && (
            <>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">De</span>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Até</span>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Valor mínimo</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={valorMin}
                  onChange={(e) => setValorMin(e.target.value)}
                  placeholder="R$"
                  className="w-36 rounded-md border border-slate-300 bg-white px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-slate-600">Valor máximo</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={valorMax}
                  onChange={(e) => setValorMax(e.target.value)}
                  placeholder="R$"
                  className="w-36 rounded-md border border-slate-300 bg-white px-3 py-2"
                />
              </label>
            </>
          )}
          {user?.role === 'CREDITO' && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-600">Ordenar por</span>
              <select
                value={ordenacao}
                onChange={(e) =>
                  setOrdenacao(e.target.value as typeof ordenacao)
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2"
              >
                <option value="data_recente">Data: mais recente</option>
                <option value="data_antiga">Data: mais antiga</option>
                <option value="valor_maior">Valor: maior</option>
                <option value="valor_menor">Valor: menor</option>
              </select>
            </label>
          )}
          <span className="text-sm text-slate-500">
            {creditRequests.length} de {filaBase.length} solicitações
          </span>
        </div>
      )}

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
          isConsultor={user?.role === 'CONSULTOR'}
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
    const consultantId =
      creditRequest.consultant?.id ?? creditRequest.consultantId
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
    branchGroup.set(consultantId, {
      name: group.name,
      requests: group.requests,
    })
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
  isConsultor = false,
}: {
  creditRequests: CreditRequest[]
  showValueColumn: boolean
  isConsultor?: boolean
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
                  {formatCurrency(creditRequest.requestedCreditLimit)}
                </td>
              )}
              <td className="py-2">
                {isConsultor ? (
                  <ConsultorStatusBadges creditRequest={creditRequest} />
                ) : (
                  <Badge
                    variant={
                      CREDIT_REQUEST_STATUS_VARIANT[creditRequest.status]
                    }
                  >
                    {CREDIT_REQUEST_STATUS_LABELS[creditRequest.status]}
                  </Badge>
                )}
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

/**
 * Visão do CONSULTOR: o status se resume às duas situações que importam para ele.
 * Sem nenhuma delas, a célula fica em branco ("—").
 */
function ConsultorStatusBadges({
  creditRequest,
}: {
  creditRequest: CreditRequest
}) {
  const temPendencia = (creditRequest.documentPendencies?.length ?? 0) > 0
  const fichaAprovada = creditRequest.fichaCadastralSituacao === 'APROVADA'

  if (!temPendencia && !fichaAprovada) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {temPendencia && (
        <Badge variant="warning">Pendência de documentação</Badge>
      )}
      {fichaAprovada && (
        <Badge variant="success">Ficha cadastral aprovada</Badge>
      )}
    </div>
  )
}
