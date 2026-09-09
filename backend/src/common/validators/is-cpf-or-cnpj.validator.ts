import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Decisao da auditoria da Fase 0 (docs/PROJECT_AUDIT.md): o sistema nao tem
 * um campo explicito de tipo PF/PJ. Pessoa fisica x juridica e distinguido
 * apenas pelo tamanho do documento (CPF = 11 digitos, CNPJ = 14 digitos).
 */
export function IsCpfOrCnpj(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCpfOrCnpj',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') return false;
          const digits = value.replace(/\D/g, '');
          return digits.length === 11 || digits.length === 14;
        },
        defaultMessage(): string {
          return '$property deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos) válido em quantidade de dígitos';
        },
      },
    });
  };
}
