import { useFormContext } from 'react-hook-form'
import { TIME_IN_BUSINESS_OPTIONS } from '../../types/time-in-business'
import { TIME_IN_BUSINESS_LABELS } from '../../lib/labels'
import {
  CheckboxField,
  InputField,
  SelectField,
  TextareaField,
} from '../../components/ui/Field'
import type { NewClientRequestFormValues } from '../../schemas/new-client-request.schema'

export function ClientFieldsSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<NewClientRequestFormValues>()

  const hasCommercialReference = watch('client.hasCommercialReference')

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Nome completo / Razão social"
          required
          error={errors.client?.name?.message}
          {...register('client.name')}
        />
        <InputField
          label="CPF ou CNPJ"
          required
          error={errors.client?.document?.message}
          {...register('client.document')}
        />
        <InputField
          label="Cônjuge"
          error={errors.client?.spouseName?.message}
          {...register('client.spouseName')}
        />
        <InputField
          label="Telefone"
          required
          error={errors.client?.phone?.message}
          {...register('client.phone')}
        />
        <InputField
          label="E-mail"
          type="email"
          required
          error={errors.client?.email?.message}
          {...register('client.email')}
        />
        <InputField
          label="CEP"
          required
          error={errors.client?.zipCode?.message}
          {...register('client.zipCode')}
        />
      </div>
      <InputField
        label="Endereço"
        required
        error={errors.client?.address?.message}
        {...register('client.address')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Município"
          required
          error={errors.client?.city?.message}
          {...register('client.city')}
        />
        <InputField
          label="UF"
          required
          maxLength={2}
          error={errors.client?.state?.message}
          {...register('client.state')}
        />
      </div>
      <SelectField
        label="Tempo de atividade"
        required
        placeholder="Selecione..."
        error={errors.client?.timeInBusiness?.message}
        {...register('client.timeInBusiness')}
      >
        {TIME_IN_BUSINESS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {TIME_IN_BUSINESS_LABELS[option]}
          </option>
        ))}
      </SelectField>
      <TextareaField
        label="Observações"
        error={errors.client?.relevantInfo?.message}
        {...register('client.relevantInfo')}
      />
      <CheckboxField
        label="Cliente possui cadastro facilitado"
        {...register('client.hasEasyRegistrationInfo')}
      />
      <CheckboxField
        label="Cliente possui referência comercial"
        {...register('client.hasCommercialReference')}
      />
      {hasCommercialReference && (
        <TextareaField
          label="Descreva a referência comercial"
          required
          error={errors.client?.commercialReferenceNotes?.message}
          {...register('client.commercialReferenceNotes')}
        />
      )}
    </div>
  )
}
