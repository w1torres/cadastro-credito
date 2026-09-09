import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema } from '../../schemas/property.schema'
import type { PropertyFormValues } from '../../schemas/property.schema'
import { InputField } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'

interface PropertyFormProps {
  onSubmit: (values: PropertyFormValues) => Promise<unknown>
  isSubmitting?: boolean
}

export function PropertyForm({ onSubmit, isSubmitting }: PropertyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyFormValues>({ resolver: zodResolver(propertySchema) })

  return (
    <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4" noValidate>
      <InputField label="Nome da propriedade" required error={errors.name?.message} {...register('name')} />
      <InputField
        label="Inscrição estadual"
        error={errors.stateRegistration?.message}
        {...register('stateRegistration')}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField label="Município" required error={errors.city?.message} {...register('city')} />
        <InputField label="UF" required maxLength={2} error={errors.state?.message} {...register('state')} />
        <InputField label="Região" required error={errors.region?.message} {...register('region')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField label="Latitude" placeholder="-29.123456" error={errors.latitude?.message} {...register('latitude')} />
        <InputField
          label="Longitude"
          placeholder="-51.654321"
          error={errors.longitude?.message}
          {...register('longitude')}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Área própria (ha)"
          required
          error={errors.ownAreaHectares?.message}
          {...register('ownAreaHectares')}
        />
        <InputField
          label="Área arrendada (ha)"
          required
          error={errors.leasedAreaHectares?.message}
          {...register('leasedAreaHectares')}
        />
        <InputField
          label="Área irrigada (ha)"
          required
          error={errors.irrigatedAreaHectares?.message}
          {...register('irrigatedAreaHectares')}
        />
      </div>
      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Salvar propriedade
      </Button>
    </form>
  )
}
