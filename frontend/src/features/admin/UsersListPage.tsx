import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { usersApi } from './usersApi'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { buttonVariants } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { ROLE_LABELS } from '../../lib/labels'
import { cn } from '../../lib/cn'

export function UsersListPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    // A API limita cada página a 100 usuários: busca todas as páginas para o filtro por filial enxergar tudo.
    queryFn: async () => {
      const primeira = await usersApi.list(1, 100)
      const todos = [...primeira.data]
      for (let pagina = 2; pagina <= primeira.meta.totalPages; pagina += 1) {
        const proxima = await usersApi.list(pagina, 100)
        todos.push(...proxima.data)
      }
      return { ...primeira, data: todos }
    },
  })
  // '' = todas as filiais; 'sem-filial' = usuários sem filial (CREDITO/ADMIN).
  const [filialFiltro, setFilialFiltro] = useState('')

  const filiais = useMemo(() => {
    const nomes = new Set<string>()
    data?.data.forEach((user) => {
      if (user.branch) nomes.add(user.branch.name)
    })
    return [...nomes].sort()
  }, [data])

  const usuariosFiltrados = useMemo(() => {
    if (!data) return []
    const filtrados = !filialFiltro
      ? data.data
      : filialFiltro === 'sem-filial'
        ? data.data.filter((user) => !user.branch)
        : data.data.filter((user) => user.branch?.name === filialFiltro)
    return [...filtrados].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [data, filialFiltro])

  return (
    <Card>
      <CardHeader tone="brand">
        <CardTitle className="text-white">Usuários</CardTitle>
        <Link
          to="/admin/users/new"
          className={cn(buttonVariants({ size: 'sm', variant: 'secondary' }))}
        >
          <Plus className="size-4" aria-hidden="true" />
          Novo Usuário
        </Link>
      </CardHeader>

      {isLoading ? (
        <Spinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="Nenhum usuário cadastrado"
          description="Cadastre o primeiro usuário para começar."
        />
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="filtro-filial"
              className="text-sm font-medium text-slate-700"
            >
              Filial
            </label>
            <select
              id="filtro-filial"
              value={filialFiltro}
              onChange={(e) => setFilialFiltro(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Todas as filiais</option>
              <option value="sem-filial">Sem filial</option>
              {filiais.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-500">
              {usuariosFiltrados.length} de {data.data.length} usuários
            </span>
          </div>
          {usuariosFiltrados.length === 0 && (
            <p className="text-sm text-slate-500">
              Nenhum usuário nesta filial.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {usuariosFiltrados.map((user) => (
              <article
                key={user.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{user.name}</h3>
                  <Badge variant={user.isActive ? 'success' : 'neutral'}>
                    {user.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <dl className="grid gap-1 text-sm">
                  <div>
                    <dt className="sr-only">E-mail</dt>
                    <dd className="break-all text-slate-600">{user.email}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Código:</dt>
                    <dd className="text-slate-900">{user.codigo ?? '—'}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Perfil:</dt>
                    <dd className="text-slate-900">{ROLE_LABELS[user.role]}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="text-slate-500">Filial:</dt>
                    <dd className="text-slate-900">
                      {user.branch?.name ?? '—'}
                    </dd>
                  </div>
                </dl>
                <div className="mt-auto flex justify-end">
                  <Link
                    to={`/admin/users/${user.id}/edit`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Editar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
