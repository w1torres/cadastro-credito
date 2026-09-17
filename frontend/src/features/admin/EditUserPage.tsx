import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from './usersApi'
import { branchesApi } from './branchesApi'
import { ApiError } from '../../lib/apiClient'
import { useToast } from '../../components/ui/Toast'
import { Card, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { InputField, SelectField, CheckboxField } from '../../components/ui/Field'
import { ROLES } from '../../types/role'
import { ROLE_LABELS } from '../../lib/labels'
import { updateUserSchema } from '../../schemas/user.schema'
import type { UpdateUserFormValues } from '../../schemas/user.schema'
import type { AdminUser } from '../../types/user'
import type { Branch } from '../../types/branch'

export function EditUserPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.get(id!),
    enabled: Boolean(id),
  })
  const { data: branches, isLoading: isLoadingBranches } = useQuery({
    queryKey: ['branches'],
    queryFn: () => branchesApi.list(),
  })

  if (isLoadingUser || isLoadingBranches) return <Spinner />
  if (!user || !id || !branches) return null

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader tone="brand">
        <CardTitle className="text-white">Editar Usuário</CardTitle>
      </CardHeader>
      <EditUserForm
        id={id}
        user={user}
        branches={branches}
        onDone={() => navigate('/admin/users')}
      />
    </Card>
  )
}

interface EditUserFormProps {
  id: string
  user: AdminUser
  branches: Branch[]
  onDone: () => void
}

function EditUserForm({ id, user, branches, onDone }: EditUserFormProps) {
  const queryClient = useQueryClient()
  const { showSuccess, showError } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      branchId: user.branchId ?? '',
    },
  })
  const role = watch('role')
  const showBranch = role === 'CONSULTOR' || role === 'GERENTE'

  const mutation = useMutation({
    mutationFn: (values: UpdateUserFormValues) =>
      usersApi.update(id!, {
        ...values,
        branchId: values.branchId || undefined,
      }),
    onSuccess: () => {
      showSuccess('Usuário atualizado com sucesso.')
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['user', id] })
      onDone()
    },
    onError: (error: unknown) => {
      showError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar o usuário.',
      )
    },
  })

  return (
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
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </SelectField>
      )}
      <CheckboxField label="Usuário ativo" {...register('isActive')} />
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={mutation.isPending}>
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}
