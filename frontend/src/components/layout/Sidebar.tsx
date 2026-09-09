import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { cn } from '../../lib/cn'

function linkClass({ isActive }: { isActive: boolean }) {
  return cn(
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium',
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100',
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
    </nav>
  )
}
