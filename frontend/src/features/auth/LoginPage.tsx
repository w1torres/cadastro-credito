import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { authApi } from './authApi'
import { useAuth } from './AuthContext'
import { ApiError } from '../../lib/apiClient'
import {
  ENTRA_CONFIGURADO,
  msalInstance,
  ENTRA_LOGIN_SCOPES,
} from '../../lib/msal'
import { Button } from '../../components/ui/Button'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // Login de teste com usuário local: só existe quando VITE_AUTH_DEV_LOGIN=true (nunca em produção).
  const loginDevHabilitado = import.meta.env.VITE_AUTH_DEV_LOGIN === 'true'

  const { data: usuariosTeste } = useQuery({
    queryKey: ['dev-users'],
    queryFn: () => authApi.devUsers(),
    enabled: loginDevHabilitado,
    retry: false,
  })

  async function handleLoginDev(email: string) {
    setFormError(null)
    setIsLoading(true)
    try {
      const session = await authApi.devLogin(email)
      login(session)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Não foi possível entrar.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleEntrarComMicrosoft() {
    setFormError(null)
    if (!msalInstance) {
      setFormError(
        'Login Microsoft não configurado (VITE_ENTRA_CLIENT_ID e VITE_ENTRA_TENANT_ID).',
      )
      return
    }
    setIsLoading(true)
    try {
      const result = await msalInstance.loginPopup({
        scopes: ENTRA_LOGIN_SCOPES,
      })
      if (!result.idToken) {
        setFormError('A Microsoft não devolveu a identidade do usuário.')
        return
      }
      const session = await authApi.loginEntra(result.idToken)
      login(session)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">
          Cadastro de Crédito Rural
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Entre com sua conta corporativa Microsoft. Seu acesso é liberado pelo
          administrador.
        </p>
        <div className="mt-6 flex flex-col gap-4">
          <Button
            type="button"
            isLoading={isLoading}
            disabled={!ENTRA_CONFIGURADO}
            onClick={() => void handleEntrarComMicrosoft()}
          >
            Entrar com Microsoft
          </Button>
          {loginDevHabilitado && (
            <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
              <p className="text-xs font-medium text-slate-500">
                Usuários de teste (local)
              </p>
              <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
                {(usuariosTeste ?? []).map((usuario) => (
                  <Button
                    key={usuario.id}
                    type="button"
                    variant="secondary"
                    disabled={isLoading}
                    onClick={() => void handleLoginDev(usuario.email)}
                  >
                    {usuario.name} — {usuario.role}
                    {usuario.branch ? ` (${usuario.branch})` : ''}
                  </Button>
                ))}
                {usuariosTeste && usuariosTeste.length === 0 && (
                  <p className="text-sm text-slate-500">
                    Nenhum usuário de teste ativo.
                  </p>
                )}
              </div>
            </div>
          )}
          {formError && (
            <p
              className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {formError}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
