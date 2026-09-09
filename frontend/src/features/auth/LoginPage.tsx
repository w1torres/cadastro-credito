import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { loginSchema } from '../../schemas/login.schema'
import type { LoginFormValues } from '../../schemas/login.schema'
import { authApi } from './authApi'
import { useAuth } from './AuthContext'
import { ApiError } from '../../lib/apiClient'
import { Button } from '../../components/ui/Button'
import { InputField } from '../../components/ui/Field'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values: LoginFormValues) {
    setFormError(null)
    try {
      const session = await authApi.login(values.email, values.password)
      login(session)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Não foi possível entrar. Tente novamente.')
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Cadastro de Crédito Rural</h1>
        <p className="mt-1 text-sm text-slate-500">Entre com seu e-mail corporativo.</p>
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="mt-6 flex flex-col gap-4" noValidate>
          <InputField
            label="E-mail"
            type="email"
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />
          <InputField
            label="Senha"
            type="password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
          {formError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {formError}
            </p>
          )}
          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Entrar
          </Button>
        </form>
      </div>
    </main>
  )
}
