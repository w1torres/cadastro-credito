import { LogOut, Menu } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { ROLE_LABELS } from '../../lib/labels'
import { Button } from '../ui/Button'

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { user, logout } = useAuth()

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Abrir menu"
          className="rounded p-1 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <span className="font-semibold text-primary">Cadastro de Crédito Rural</span>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">
            {user.name} — {ROLE_LABELS[user.role]}
          </span>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="size-4" aria-hidden="true" />
            Sair
          </Button>
        </div>
      )}
    </header>
  )
}
