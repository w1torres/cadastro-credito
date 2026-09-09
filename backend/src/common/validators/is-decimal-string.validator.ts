import { registerDecorator, ValidationOptions } from 'class-validator';

export interface IsDecimalStringOptions {
  /** Necessário para latitude/longitude, que no Brasil são sempre negativas. */
  allowNegative?: boolean;
  /** Casas decimais máximas aceitas. Default 2 (hectares, valores em R$). */
  maxDecimals?: number;
}

/**
 * Campos Decimal do Prisma devem ser recebidos como string numerica (nao
 * `number`), para evitar arredondamento de ponto flutuante ao gravar em
 * colunas `numeric` do Postgres.
 */
export function IsDecimalString(
  options: IsDecimalStringOptions = {},
  validationOptions?: ValidationOptions,
) {
  const { allowNegative = false, maxDecimals = 2 } = options;
  const pattern = new RegExp(
    `^${allowNegative ? '-?' : ''}\\d+(\\.\\d{1,${maxDecimals}})?$`,
  );

  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDecimalString',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && pattern.test(value);
        },
        defaultMessage(): string {
          return `$property deve ser uma string numérica${allowNegative ? ' (pode ser negativa)' : ''} com até ${maxDecimals} casas decimais (ex.: "123.45")`;
        },
      },
    });
  };
}
