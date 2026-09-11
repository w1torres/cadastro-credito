import type { CreditRequestFormValues } from '../../schemas/credit-request.schema'
import type {
  CreateCreditRequestInput,
  CreditRequest,
} from '../../types/credit-request'

function emptyToUndefined(value: string | undefined): string | undefined {
  return value ? value : undefined
}

function digitsToNumber(value: string | undefined): number | undefined {
  return value ? Number(value) : undefined
}

function mapFormFields(
  values: CreditRequestFormValues,
): Omit<CreateCreditRequestInput, 'clientId'> {
  return {
    ...values,
    leasedAreaPlantingHectares: emptyToUndefined(
      values.leasedAreaPlantingHectares,
    ),
    landAcquisitionHectares: emptyToUndefined(values.landAcquisitionHectares),
    landAcquisitionLocation: emptyToUndefined(values.landAcquisitionLocation),
    landAcquisitionYear: digitsToNumber(values.landAcquisitionYear),
    landAcquisitionInstallments: digitsToNumber(
      values.landAcquisitionInstallments,
    ),
    newMachineryDescription: emptyToUndefined(values.newMachineryDescription),
    otherActivityDescription: emptyToUndefined(values.otherActivityDescription),
  }
}

export function toCreateCreditRequestInput(
  values: CreditRequestFormValues,
  clientId: string,
): CreateCreditRequestInput {
  return { ...mapFormFields(values), clientId }
}

export function toUpdateCreditRequestInput(
  values: CreditRequestFormValues,
): Omit<CreateCreditRequestInput, 'clientId'> {
  return mapFormFields(values)
}

export function toCreditRequestFormValues(
  creditRequest: CreditRequest,
): CreditRequestFormValues {
  return {
    requestedCreditLimit: creditRequest.requestedCreditLimit,
    leasedAreaPlanting: creditRequest.leasedAreaPlanting,
    leasedAreaPlantingHectares: creditRequest.leasedAreaPlantingHectares ?? '',
    firstHarvestAreaPlanting: creditRequest.firstHarvestAreaPlanting,
    barterModality: creditRequest.barterModality,
    hasRenegotiatedDebts: creditRequest.hasRenegotiatedDebts,
    landAcquisition: creditRequest.landAcquisition,
    landAcquisitionHectares: creditRequest.landAcquisitionHectares ?? '',
    landAcquisitionYear: creditRequest.landAcquisitionYear
      ? String(creditRequest.landAcquisitionYear)
      : '',
    landAcquisitionLocation: creditRequest.landAcquisitionLocation ?? '',
    landAcquisitionInstallments: creditRequest.landAcquisitionInstallments
      ? String(creditRequest.landAcquisitionInstallments)
      : '',
    newMachineryAcquisition: creditRequest.newMachineryAcquisition,
    newMachineryDescription: creditRequest.newMachineryDescription ?? '',
    otherActivity: creditRequest.otherActivity,
    otherActivityDescription: creditRequest.otherActivityDescription ?? '',
  }
}
