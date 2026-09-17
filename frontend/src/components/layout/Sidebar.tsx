import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, UserCog } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { cn } from '../../lib/cn'

function linkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary text-white shadow-sm shadow-primary/30'
      : 'text-slate-600 hover:bg-slate-100',
  )
}

export function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const { user } = useAuth()

  return (
    <nav className="flex flex-col gap-1 p-4">
      <NavLink to="/dashboard" className={linkClass} onClick={onNavigate}>
        <LayoutDashboard className="size-4" aria-hidden="true" />
        {user?.role === 'CONSULTOR' ? 'Minhas Solicitações' : 'Fila de Análise'}
      </NavLink>
      {(user?.role === 'CONSULTOR' || user?.role === 'ADMIN') && (
        <NavLink to="/clients" className={linkClass} onClick={onNavigate}>
          <Users className="size-4" aria-hidden="true" />
          Clientes
        </NavLink>
      )}
      {user?.role === 'ADMIN' && (
        <NavLink to="/admin/users" className={linkClass} onClick={onNavigate}>
          <UserCog className="size-4" aria-hidden="true" />
          Usuários
        </NavLink>
      )}
    </nav>
  )
}
