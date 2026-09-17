import { useState } from 'react'
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { InputField } from '../../components/ui/Field'
import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/cn'
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

const FIRST_HARVEST_LABEL = '1ª Safra'
const SECOND_HARVEST_LABEL = '2ª Safra'
const FIRST_HARVEST_CROPS = ['Soja', 'Milho Verão', 'Feijão Verão']
const SECOND_HARVEST_CROPS = ['Milho Safrinha', 'Sorgo', 'Feijão 2ª Safra']
const FIXED_HARVEST_LABELS = [FIRST_HARVEST_LABEL, SECOND_HARVEST_LABEL]

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
              <RemovePropertyButton
                index={index}
                control={control}
                onRemove={() => remove(index)}
              />
            )}
          </div>
          <div className="flex flex-col gap-5 p-5">
            <PropertyFields propertyIndex={index} />
            <ProductionSection propertyIndex={index} />
          </div>
        </div>
      ))}
    </div>
  )
}

function RemovePropertyButton({
  index,
  control,
  onRemove,
}: {
  index: number
  control: Control<NewClientRequestFormValues>
  onRemove: () => void
}) {
  const persistedId = useWatch({
    control: control as unknown as Control<Record<string, unknown>>,
    name: `properties.${index}.id`,
  }) as string | undefined

  if (persistedId) {
    return (
      <span
        className="text-xs text-slate-400"
        title="Fazendas já salvas não podem ser removidas por aqui."
      >
        Já salva
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remover fazenda"
      className="text-red-600 hover:text-red-800"
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </button>
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
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-amber-900">
          Área da propriedade
        </p>
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
      </div>
    </>
  )
}

type SafraTab = 'FIRST' | 'SECOND' | 'OTHER'

const SAFRA_TABS: { key: SafraTab; label: string }[] = [
  { key: 'FIRST', label: FIRST_HARVEST_LABEL },
  { key: 'SECOND', label: SECOND_HARVEST_LABEL },
  { key: 'OTHER', label: 'Outras Culturas' },
]

function ProductionSection({ propertyIndex }: { propertyIndex: number }) {
  const [activeTab, setActiveTab] = useState<SafraTab>('FIRST')

  return (
    <div className="border-t border-slate-200 pt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-slate-700">
          Área de produção para a próxima safra (hectares)
        </span>
        <span className="text-xs text-slate-500">Informe os hectares por cultura.</span>
      </div>

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {SAFRA_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-t-md px-4 py-2 text-sm font-semibold transition-colors',
              activeTab === tab.key
                ? 'bg-primary-dark text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'FIRST' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {FIRST_HARVEST_CROPS.map((cropName) => (
            <FixedCropField
              key={cropName}
              propertyIndex={propertyIndex}
              harvestLabel={FIRST_HARVEST_LABEL}
              cropName={cropName}
            />
          ))}
        </div>
      )}

      {activeTab === 'SECOND' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {SECOND_HARVEST_CROPS.map((cropName) => (
            <FixedCropField
              key={cropName}
              propertyIndex={propertyIndex}
              harvestLabel={SECOND_HARVEST_LABEL}
              cropName={cropName}
            />
          ))}
        </div>
      )}

      {activeTab === 'OTHER' && <OtherCropsRows propertyIndex={propertyIndex} />}
    </div>
  )
}

function FixedCropField({
  propertyIndex,
  harvestLabel,
  cropName,
}: {
  propertyIndex: number
  harvestLabel: string
  cropName: string
}) {
  const { register, control } = useFormContext<NewClientRequestFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `properties.${propertyIndex}.productions`,
  })

  const index = fields.findIndex(
    (production) =>
      production.harvestYear === harvestLabel && production.cropName === cropName,
  )

  if (index === -1) {
    return (
      <InputField
        label={cropName}
        placeholder="0"
        onChange={(event) => {
          const value = event.target.value
          if (value.trim() !== '') {
            append({ harvestYear: harvestLabel, cropName, hectares: value })
          }
        }}
      />
    )
  }

  const registered = register(
    `properties.${propertyIndex}.productions.${index}.hectares`,
  )

  return (
    <InputField
      label={cropName}
      placeholder="0"
      {...registered}
      onChange={(event) => {
        void registered.onChange(event)
        if (event.target.value.trim() === '') remove(index)
      }}
    />
  )
}

function OtherCropsRows({ propertyIndex }: { propertyIndex: number }) {
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

  const otherRows = fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => !FIXED_HARVEST_LABELS.includes(field.harvestYear))

  return (
    <div>
      <div className="mb-3 flex justify-end">
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

      {otherRows.length === 0 ? (
        <p className="text-sm text-slate-500">
          Nenhuma outra cultura informada para esta fazenda.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {otherRows.map(({ index }) => (
            <div
              key={index}
              className="grid grid-cols-1 gap-3 rounded-md bg-slate-50 p-3 sm:grid-cols-[1fr_2fr_1fr_auto] sm:items-end"
            >
              <InputField
                label="Safra"
                placeholder="2026/2027"
                error={productionErrors?.[index]?.harvestYear?.message}
                {...register(
                  `properties.${propertyIndex}.productions.${index}.harvestYear`,
                )}
              />
              <InputField
                label="Cultura"
                list={`crop-options-${propertyIndex}`}
                error={productionErrors?.[index]?.cropName?.message}
                {...register(
                  `properties.${propertyIndex}.productions.${index}.cropName`,
                )}
              />
              <InputField
                label="Hectares"
                error={productionErrors?.[index]?.hectares?.message}
                {...register(
                  `properties.${propertyIndex}.productions.${index}.hectares`,
                )}
              />
              <button
                type="button"
                onClick={() => remove(index)}
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
