import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from './usersApi'
import { branchesApi } from './branchesApi'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { InputField, SelectField } from '../../components/ui/Field'
import { ROLES } from '../../types/role'
import { ROLE_LABELS } from '../../lib/labels'
import { createUserSchema } from '../../schemas/user.schema'
import type { CreateUserFormValues } from '../../schemas/user.schema'

export function NewUserPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.list(),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
  })
  const role = watch('role')
  const showBranch = role === 'CONSULTOR' || role === 'GERENTE'

  const mutation = useMutation({
    mutationFn: (values: CreateUserFormValues) =>
      usersApi.create({
        ...values,
        branchId: values.branchId || undefined,
      }),
    onSuccess: () => {
      showSuccess('Usuário criado com sucesso.')
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      navigate('/admin/users')
    },
    onError: (error: unknown) => {
      showError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível criar o usuário.',
      )
    },
  })

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader tone="brand">
        <CardTitle className="text-white">Novo Usuário</CardTitle>
      </CardHeader>
      <form
        onSubmit={(e) => void handleSubmit((values) => mutation.mutateAsync(values))(e)}
        className="flex flex-col gap-4"
        noValidate
      >
        <InputField
          label="Nome completo"
          required
          error={errors.name?.message}
          {...register('name')}
        />
        <InputField
          label="E-mail"
          type="email"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <InputField
          label="Senha"
          type="password"
          required
          hint="Mínimo de 8 caracteres."
          error={errors.password?.message}
          {...register('password')}
        />
        <SelectField
          label="Perfil"
          required
          placeholder="Selecione..."
          error={errors.role?.message}
          {...register('role')}
        >
          {ROLES.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {ROLE_LABELS[roleOption]}
            </option>
          ))}
        </SelectField>
        {showBranch && (
          <SelectField
            label="Filial"
            required
            placeholder="Selecione..."
            error={errors.branchId?.message}
            {...register('branchId')}
          >
            {branches?.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </SelectField>
        )}
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/users')}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Criar Usuário
          </Button>
        </div>
      </form>
    </Card>
  )
}
