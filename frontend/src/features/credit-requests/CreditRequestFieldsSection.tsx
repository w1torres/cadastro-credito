import { useFormContext } from 'react-hook-form'
import {
  CheckboxField,
  InputField,
  TextareaField,
} from '../../components/ui/Field'
import type { NewClientRequestFormValues } from '../../schemas/new-client-request.schema'

export function CreditRequestFieldsSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<NewClientRequestFormValues>()

  const leasedAreaPlanting = watch('creditRequest.leasedAreaPlanting')
  const landAcquisition = watch('creditRequest.landAcquisition')
  const newMachineryAcquisition = watch('creditRequest.newMachineryAcquisition')
  const otherActivity = watch('creditRequest.otherActivity')

  return (
    <div className="flex flex-col gap-4">
      <InputField
        label="Valor de crédito solicitado (R$)"
        required
        placeholder="150000.00"
        error={errors.creditRequest?.requestedCreditLimit?.message}
        {...register('creditRequest.requestedCreditLimit')}
      />

      <CheckboxField
        label="Plantio em área arrendada"
        {...register('creditRequest.leasedAreaPlanting')}
      />
      {leasedAreaPlanting && (
        <InputField
          label="Área arrendada para plantio (ha)"
          error={errors.creditRequest?.leasedAreaPlantingHectares?.message}
          {...register('creditRequest.leasedAreaPlantingHectares')}
        />
      )}

      <CheckboxField
        label="Plantio de primeira safra na área"
        {...register('creditRequest.firstHarvestAreaPlanting')}
      />
      <CheckboxField
        label="Modalidade de troca (barter)"
        {...register('creditRequest.barterModality')}
      />
      <CheckboxField
        label="Possui dívidas renegociadas"
        {...register('creditRequest.hasRenegotiatedDebts')}
      />

      <CheckboxField
        label="Aquisição de terras"
        {...register('creditRequest.landAcquisition')}
      />
      {landAcquisition && (
        <div className="grid gap-4 rounded-md bg-slate-50 p-4 sm:grid-cols-2">
          <InputField
            label="Área adquirida (ha)"
            error={errors.creditRequest?.landAcquisitionHectares?.message}
            {...register('creditRequest.landAcquisitionHectares')}
          />
          <InputField
            label="Ano da aquisição"
            placeholder="2026"
            error={errors.creditRequest?.landAcquisitionYear?.message}
            {...register('creditRequest.landAcquisitionYear')}
          />
          <InputField
            label="Local da aquisição"
            error={errors.creditRequest?.landAcquisitionLocation?.message}
            {...register('creditRequest.landAcquisitionLocation')}
          />
          <InputField
            label="Número de parcelas"
            error={errors.creditRequest?.landAcquisitionInstallments?.message}
            {...register('creditRequest.landAcquisitionInstallments')}
          />
        </div>
      )}

      <CheckboxField
        label="Aquisição de maquinário novo"
        {...register('creditRequest.newMachineryAcquisition')}
      />
      {newMachineryAcquisition && (
        <TextareaField
          label="Descreva o maquinário"
          error={errors.creditRequest?.newMachineryDescription?.message}
          {...register('creditRequest.newMachineryDescription')}
        />
      )}

      <CheckboxField
        label="Outra atividade relevante"
        {...register('creditRequest.otherActivity')}
      />
      {otherActivity && (
        <TextareaField
          label="Descreva a atividade"
          error={errors.creditRequest?.otherActivityDescription?.message}
          {...register('creditRequest.otherActivityDescription')}
        />
      )}
    </div>
  )
}
