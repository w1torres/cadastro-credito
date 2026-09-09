import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema } from '../../schemas/client.schema'
import type { ClientFormValues } from '../../schemas/client.schema'
import { TIME_IN_BUSINESS_OPTIONS } from '../../types/time-in-business'
import { TIME_IN_BUSINESS_LABELS } from '../../lib/labels'
import { CheckboxField, InputField, SelectField, TextareaField } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'

interface ClientFormProps {
  onSubmit: (values: ClientFormValues) => Promise<unknown>
  isSubmitting?: boolean
}

export function ClientForm({ onSubmit, isSubmitting }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      hasEasyRegistrationInfo: false,
      hasCommercialReference: false,
    },
  })

  const hasCommercialReference = watch('hasCommercialReference')

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Nome completo / Razão social" required error={errors.name?.message} {...register('name')} />
        <InputField label="CPF ou CNPJ" required error={errors.document?.message} {...register('document')} />
        <InputField label="Cônjuge" error={errors.spouseName?.message} {...register('spouseName')} />
        <InputField label="Telefone" required error={errors.phone?.message} {...register('phone')} />
        <InputField label="E-mail" type="email" required error={errors.email?.message} {...register('email')} />
        <InputField label="CEP" required error={errors.zipCode?.message} {...register('zipCode')} />
      </div>
      <InputField label="Endereço" required error={errors.address?.message} {...register('address')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Município" required error={errors.city?.message} {...register('city')} />
        <InputField label="UF" required maxLength={2} error={errors.state?.message} {...register('state')} />
      </div>
      <SelectField
        label="Tempo de atividade"
        required
        placeholder="Selecione..."
        error={errors.timeInBusiness?.message}
        {...register('timeInBusiness')}
      >
        {TIME_IN_BUSINESS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {TIME_IN_BUSINESS_LABELS[option]}
          </option>
        ))}
      </SelectField>
      <TextareaField label="Observações" error={errors.relevantInfo?.message} {...register('relevantInfo')} />
      <CheckboxField label="Cliente possui cadastro facilitado" {...register('hasEasyRegistrationInfo')} />
      <CheckboxField label="Cliente possui referência comercial" {...register('hasCommercialReference')} />
      {hasCommercialReference && (
        <TextareaField
          label="Descreva a referência comercial"
          required
          error={errors.commercialReferenceNotes?.message}
          {...register('commercialReferenceNotes')}
        />
      )}
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Salvar cliente
      </Button>
    </form>
  )
}
