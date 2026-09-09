import { z } from 'zod'

/**
 * Espelha `backend/src/common/validators/is-decimal-string.validator.ts` —
 * o backend recebe campos Decimal como string numérica (nunca `number`) para
 * evitar arredondamento de ponto flutuante.
 */
export function decimalString(options: { allowNegative?: boolean; maxDecimals?: number } = {}) {
  const { allowNegative = false, maxDecimals = 2 } = options
  const pattern = new RegExp(`^${allowNegative ? '-?' : ''}\\d+(\\.\\d{1,${maxDecimals}})?$`)
  return z
    .string()
    .trim()
    .min(1, 'Campo obrigatório')
    .regex(pattern, `Informe um número válido com até ${maxDecimals} casas decimais`)
}
