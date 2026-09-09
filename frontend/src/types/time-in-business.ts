export const TIME_IN_BUSINESS_OPTIONS = [
  'MORE_THAN_10_YEARS',
  'FROM_5_TO_10_YEARS',
  'FROM_3_TO_5_YEARS',
  'LESS_THAN_3_YEARS',
] as const
export type TimeInBusiness = (typeof TIME_IN_BUSINESS_OPTIONS)[number]
