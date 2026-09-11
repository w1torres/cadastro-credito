import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { InputField } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { PREDEFINED_CROPS } from '../../lib/crops'
import type { NewClientRequestFormValues } from '../../schemas/new-client-request.schema'

const EMPTY_PRODUCTION = { harvestYear: '', cropName: '', hectares: '' }
const EMPTY_PROPERTY = {
  name: '',
  stateRegistration: '',
  city: '',
  state: '',
  region: '',
  latitude: '',
  longitude: '',
  ownAreaHectares: '',
  leasedAreaHectares: '',
  irrigatedAreaHectares: '',
  productions: [] as {
    harvestYear: string
    cropName: string
    hectares: string
  }[],
}

export function PropertiesSection() {
  const { control } = useFormContext<NewClientRequestFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'properties',
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => append(EMPTY_PROPERTY)}
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar fazenda
        </Button>
      </div>

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="rounded-xl border-2 border-slate-200 bg-white"
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3">
            <span className="text-lg font-bold text-slate-800">
              Fazenda {index + 1}
            </span>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                aria-label="Remover fazenda"
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="flex flex-col gap-5 p-5">
            <PropertyFields propertyIndex={index} />
            <ProductionRows propertyIndex={index} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PropertyFields({ propertyIndex }: { propertyIndex: number }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<NewClientRequestFormValues>()
  const propertyErrors = errors.properties?.[propertyIndex]

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Nome da propriedade"
          required
          error={propertyErrors?.name?.message}
          {...register(`properties.${propertyIndex}.name`)}
        />
        <InputField
          label="Inscrição estadual"
          error={propertyErrors?.stateRegistration?.message}
          {...register(`properties.${propertyIndex}.stateRegistration`)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Município"
          required
          error={propertyErrors?.city?.message}
          {...register(`properties.${propertyIndex}.city`)}
        />
        <InputField
          label="UF"
          required
          maxLength={2}
          error={propertyErrors?.state?.message}
          {...register(`properties.${propertyIndex}.state`)}
        />
        <InputField
          label="Região"
          required
          error={propertyErrors?.region?.message}
          {...register(`properties.${propertyIndex}.region`)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <InputField
          label="Latitude"
          placeholder="-29.123456"
          error={propertyErrors?.latitude?.message}
          {...register(`properties.${propertyIndex}.latitude`)}
        />
        <InputField
          label="Longitude"
          placeholder="-51.654321"
          error={propertyErrors?.longitude?.message}
          {...register(`properties.${propertyIndex}.longitude`)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <InputField
          label="Área própria (ha)"
          required
          error={propertyErrors?.ownAreaHectares?.message}
          {...register(`properties.${propertyIndex}.ownAreaHectares`)}
        />
        <InputField
          label="Área arrendada (ha)"
          required
          error={propertyErrors?.leasedAreaHectares?.message}
          {...register(`properties.${propertyIndex}.leasedAreaHectares`)}
        />
        <InputField
          label="Área irrigada (ha)"
          required
          error={propertyErrors?.irrigatedAreaHectares?.message}
          {...register(`properties.${propertyIndex}.irrigatedAreaHectares`)}
        />
      </div>
    </>
  )
}

function ProductionRows({ propertyIndex }: { propertyIndex: number }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<NewClientRequestFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `properties.${propertyIndex}.productions`,
  })
  const productionErrors = errors.properties?.[propertyIndex]?.productions

  return (
    <div className="border-t border-slate-200 pt-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <span className="font-semibold text-slate-700">
          Produção agrícola (safra atual)
        </span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => append(EMPTY_PRODUCTION)}
        >
          <Plus className="size-4" aria-hidden="true" />
          Adicionar cultura
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhuma cultura informada para esta fazenda.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field, cropIndex) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 rounded-md bg-slate-50 p-3 sm:grid-cols-[1fr_2fr_1fr_auto] sm:items-end"
            >
              <InputField
                label="Safra"
                placeholder="2026/2027"
                error={productionErrors?.[cropIndex]?.harvestYear?.message}
                {...register(
                  `properties.${propertyIndex}.productions.${cropIndex}.harvestYear`,
                )}
              />
              <InputField
                label="Cultura"
                list={`crop-options-${propertyIndex}`}
                error={productionErrors?.[cropIndex]?.cropName?.message}
                {...register(
                  `properties.${propertyIndex}.productions.${cropIndex}.cropName`,
                )}
              />
              <InputField
                label="Hectares"
                error={productionErrors?.[cropIndex]?.hectares?.message}
                {...register(
                  `properties.${propertyIndex}.productions.${cropIndex}.hectares`,
                )}
              />
              <button
                type="button"
                onClick={() => remove(cropIndex)}
                aria-label="Remover cultura"
                className="justify-self-start text-red-600 hover:text-red-800 sm:justify-self-center"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
      <datalist id={`crop-options-${propertyIndex}`}>
        {PREDEFINED_CROPS.map((crop) => (
          <option key={crop} value={crop} />
        ))}
      </datalist>
    </div>
  )
}
