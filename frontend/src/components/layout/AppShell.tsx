import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

/** Sidebar fixa no desktop; vira drawer com overlay abaixo de 768px (regra de responsividade da spec 02). */
export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-svh flex-col bg-slate-50 md:flex-row">
      <div className="hidden md:block md:w-64 md:shrink-0 md:border-r md:border-slate-200 md:bg-white">
        <Sidebar onNavigate={() => undefined} />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-50 h-full w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4">
              <span className="font-semibold text-slate-900">Menu</span>
              <button type="button" onClick={() => setDrawerOpen(false)} aria-label="Fechar menu">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <Sidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <TopBar onOpenMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
