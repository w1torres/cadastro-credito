# Especificação 09 — Testes e Critérios de Aceite

## Unitários

Cobrir:

- workflow;
- permissões;
- validações;
- serviços;
- regras de devolução.

## Integração

Cobrir:

- API;
- banco;
- autenticação;
- workflow;
- documentos.

## E2E

Cenário principal:

1. login consultor;
2. criar cliente;
3. cadastrar propriedade;
4. cadastrar produção;
5. anexar documento;
6. enviar ao gerente;
7. gerente analisa;
8. gerente devolve;
9. consultor corrige;
10. consultor reenvia;
11. gerente encaminha ao crédito;
12. crédito devolve ao gerente;
13. gerente revisa;
14. crédito aprova;
15. documento é gerado/anexado;
16. assinatura é criada;
17. webhook é processado;
18. processo é concluído.

## Critérios

### UX

- [ ] wizard funcional;
- [ ] mobile funcional;
- [ ] desktop funcional;
- [ ] validações;
- [ ] autosave;
- [ ] revisão;
- [ ] feedback.

### Workflow

- [ ] transições válidas;
- [ ] transições inválidas bloqueadas;
- [ ] devoluções;
- [ ] motivos obrigatórios;
- [ ] histórico.

### Segurança

- [ ] autenticação;
- [ ] RBAC;
- [ ] validação;
- [ ] upload seguro;
- [ ] secrets protegidos.

### Qualidade

Executar:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Adicionar E2E ao pipeline quando configurado.
