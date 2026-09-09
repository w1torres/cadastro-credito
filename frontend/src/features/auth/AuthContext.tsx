import { createContext, useContext, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { clearSession, getSession, setSession, subscribeToSession } from '../../lib/session'
import type { AuthUser, Session } from '../../types/auth'

interface AuthContextValue {
  session: Session | null
  user: AuthUser | null
  login: (session: Session) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeToSession, getSession, getSession)

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    login: setSession,
    logout: clearSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
