export const ROLES = ['CONSULTOR', 'GERENTE', 'CREDITO', 'ADMIN'] as const
export type Role = (typeof ROLES)[number]
