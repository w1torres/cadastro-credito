# Especificação 08 — Frontend e Componentes

## Stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Tailwind CSS
- shadcn/ui
- Lucide React
- TanStack Table

## Estrutura

```text
src/
├── app/
├── components/
│   ├── ui/
│   ├── forms/
│   ├── workflow/
│   ├── documents/
│   └── layout/
├── features/
│   ├── auth/
│   ├── clients/
│   ├── properties/
│   ├── credit/
│   ├── documents/
│   ├── workflow/
│   └── signatures/
├── hooks/
├── lib/
├── schemas/
├── services/
├── types/
└── routes/
```

## Componentes sugeridos

- FormField
- CurrencyField
- CpfCnpjField
- PhoneField
- CepField
- PropertyCard
- PartnerCard
- DocumentUploader
- WorkflowStepper
- WorkflowTimeline
- StatusBadge
- ApprovalPanel
- CommentBox
- SignatureStatus
- ConfirmationDialog

## Formulários

React Hook Form + Zod.

Evitar componentes monolíticos.

## Estado

TanStack Query para estado remoto.

Context somente quando necessário.

Não introduzir Redux sem problema concreto.

## Wizard

Cada etapa deve ter:

- schema;
- validação;
- carregamento;
- salvamento;
- navegação.

## Autosave

Implementar de forma segura.

Mostrar:

`✓ Salvo automaticamente às HH:mm`

Não perder dados.

## Acessibilidade

Garantir:

- labels;
- foco;
- teclado;
- contraste;
- mensagens acessíveis;
- touchscreen.

## Responsividade

Mobile-first.

Desktop pode apresentar sidebar e stepper completo.

Mobile deve apresentar drawer e indicador compacto.
