import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { creditRequestSchema } from '../../schemas/credit-request.schema'
import type { CreditRequestFormValues } from '../../schemas/credit-request.schema'
import {
  CheckboxField,
  InputField,
  TextareaField,
} from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'

interface CreditRequestFormProps {
  onSubmit: (values: CreditRequestFormValues) => Promise<unknown>
  isSubmitting?: boolean
  defaultValues?: Partial<CreditRequestFormValues>
}

const BASE_DEFAULTS: CreditRequestFormValues = {
  requestedCreditLimit: '',
  leasedAreaPlanting: false,
  firstHarvestAreaPlanting: false,
  barterModality: false,
  hasRenegotiatedDebts: false,
  landAcquisition: false,
  newMachineryAcquisition: false,
  otherActivity: false,
}

export function CreditRequestForm({
  onSubmit,
  isSubmitting,
  defaultValues,
}: CreditRequestFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreditRequestFormValues>({
    resolver: zodResolver(creditRequestSchema),
    defaultValues: { ...BASE_DEFAULTS, ...defaultValues },
  })

  const leasedAreaPlanting = watch('leasedAreaPlanting')
  const landAcquisition = watch('landAcquisition')
  const newMachineryAcquisition = watch('newMachineryAcquisition')
  const otherActivity = watch('otherActivity')

  return (
    <form
      onSubmit={(e) => void handleSubmit(onSubmit)(e)}
      className="flex flex-col gap-4"
      noValidate
    >
      <InputField
        label="Valor de crédito solicitado (R$)"
        required
        placeholder="150000.00"
        error={errors.requestedCreditLimit?.message}
        {...register('requestedCreditLimit')}
      />

      <CheckboxField
        label="Plantio em área arrendada"
        {...register('leasedAreaPlanting')}
      />
      {leasedAreaPlanting && (
        <InputField
          label="Área arrendada para plantio (ha)"
          error={errors.leasedAreaPlantingHectares?.message}
          {...register('leasedAreaPlantingHectares')}
        />
      )}

      <CheckboxField
        label="Plantio de primeira safra na área"
        {...register('firstHarvestAreaPlanting')}
      />
      <CheckboxField
        label="Modalidade de troca (barter)"
        {...register('barterModality')}
      />
      <CheckboxField
        label="Possui dívidas renegociadas"
        {...register('hasRenegotiatedDebts')}
      />

      <CheckboxField
        label="Aquisição de terras"
        {...register('landAcquisition')}
      />
      {landAcquisition && (
        <div className="grid gap-4 rounded-md bg-slate-50 p-4 sm:grid-cols-2">
          <InputField
            label="Área adquirida (ha)"
            error={errors.landAcquisitionHectares?.message}
            {...register('landAcquisitionHectares')}
          />
          <InputField
            label="Ano da aquisição"
            placeholder="2026"
            error={errors.landAcquisitionYear?.message}
            {...register('landAcquisitionYear')}
          />
          <InputField
            label="Local da aquisição"
            error={errors.landAcquisitionLocation?.message}
            {...register('landAcquisitionLocation')}
          />
          <InputField
            label="Número de parcelas"
            error={errors.landAcquisitionInstallments?.message}
            {...register('landAcquisitionInstallments')}
          />
        </div>
      )}

      <CheckboxField
        label="Aquisição de maquinário novo"
        {...register('newMachineryAcquisition')}
      />
      {newMachineryAcquisition && (
        <TextareaField
          label="Descreva o maquinário"
          error={errors.newMachineryDescription?.message}
          {...register('newMachineryDescription')}
        />
      )}

      <CheckboxField
        label="Outra atividade relevante"
        {...register('otherActivity')}
      />
      {otherActivity && (
        <TextareaField
          label="Descreva a atividade"
          error={errors.otherActivityDescription?.message}
          {...register('otherActivityDescription')}
        />
      )}

      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Salvar solicitação
      </Button>
    </form>
  )
}
