-- Dados de teste para validar as pendências de documento na visão do consultor.
-- Cria uma pendência FALTANTE (Contrato Social) e uma ERRADA (DRE) na solicitação informada.
-- NÃO executar em produção. Use uma solicitação de teste.
--
-- Uso:
--   psql "<string de conexão>" -v crid='<id da solicitação>' -v uid='<id de um usuário GERENTE ou CREDITO>' -f scripts/teste_pendencia.sql
--
-- Para remover depois:
--   DELETE FROM "document_pendencies" WHERE "creditRequestId" = '<id da solicitação>';

INSERT INTO "document_pendencies" ("id", "creditRequestId", "type", "motivo", "markedById", "createdAt")
VALUES
  (gen_random_uuid()::text, :'crid', 'CONTRATO_SOCIAL', 'FALTANTE', :'uid', now()),
  (gen_random_uuid()::text, :'crid', 'DRE', 'ERRADO', :'uid', now())
ON CONFLICT ("creditRequestId", "type") DO NOTHING;
