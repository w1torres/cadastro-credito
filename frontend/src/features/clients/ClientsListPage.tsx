import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { clientsApi } from './clientsApi'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { buttonVariants } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn } from '../../lib/cn'

export function ClientsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['clients'], queryFn: () => clientsApi.list() })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <Link to="/clients/new" className={cn(buttonVariants({ size: 'sm' }))}>
          <Plus className="size-4" aria-hidden="true" />
          Novo Cliente
        </Link>
      </CardHeader>

      {isLoading ? (
        <Spinner />
      ) : !data || data.data.length === 0 ? (
        <EmptyState title="Nenhum cliente cadastrado" description="Cadastre o primeiro cliente para começar." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium">Documento</th>
                <th className="py-2 font-medium">Cidade/UF</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-2">
                    <Link to={`/clients/${client.id}`} className="font-medium text-primary hover:underline">
                      {client.name}
                    </Link>
                  </td>
                  <td className="py-2 text-slate-600">{client.document}</td>
                  <td className="py-2 text-slate-600">
                    {client.city}/{client.state}
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
