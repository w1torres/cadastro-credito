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
    queryFn: () => usersApi.list(),
  })

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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium">E-mail</th>
                <th className="py-2 font-medium">Perfil</th>
                <th className="py-2 font-medium">Filial</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {data.data.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2 font-medium text-slate-900">{user.name}</td>
                  <td className="py-2 text-slate-600">{user.email}</td>
                  <td className="py-2 text-slate-600">{ROLE_LABELS[user.role]}</td>
                  <td className="py-2 text-slate-600">
                    {user.branch?.name ?? '—'}
                  </td>
                  <td className="py-2">
                    <Badge variant={user.isActive ? 'success' : 'neutral'}>
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">
                    <Link
                      to={`/admin/users/${user.id}/edit`}
                      className="font-medium text-primary hover:underline"
                    >
                      Editar
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
