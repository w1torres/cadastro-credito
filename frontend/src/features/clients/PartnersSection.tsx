import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { InputField } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import type { NewClientRequestFormValues } from '../../schemas/new-client-request.schema'

const EMPTY_PARTNER = {
  name: '',
  document: '',
  phone: '',
  email: '',
  address: '',
}

export function PartnersSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NewClientRequestFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'partners',
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => append(EMPTY_PARTNER)}
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar sócio
        </Button>
      </div>

      {fields.length === 0 ? (
        <EmptyState
          title="Nenhum sócio cadastrado"
          description="Adicione um sócio caso o cliente possua."
        />
      ) : (
        fields.map((field, index) => (
          <div
            key={field.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                {index + 1}) Sócio
              </span>
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remover sócio"
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Nome do sócio"
                required
                error={errors.partners?.[index]?.name?.message}
                {...register(`partners.${index}.name`)}
              />
              <InputField
                label="CPF ou CNPJ"
                required
                error={errors.partners?.[index]?.document?.message}
                {...register(`partners.${index}.document`)}
              />
              <InputField
                label="Telefone"
                required
                error={errors.partners?.[index]?.phone?.message}
                {...register(`partners.${index}.phone`)}
              />
              <InputField
                label="E-mail"
                type="email"
                required
                error={errors.partners?.[index]?.email?.message}
                {...register(`partners.${index}.email`)}
              />
              <div className="sm:col-span-2">
                <InputField
                  label="Endereço"
                  required
                  error={errors.partners?.[index]?.address?.message}
                  {...register(`partners.${index}.address`)}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
