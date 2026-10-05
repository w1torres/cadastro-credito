-- CreateEnum
CREATE TYPE "FichaCadastralSituacao" AS ENUM ('EM_ANALISE', 'APROVADA', 'REPROVADA');

-- AlterTable
ALTER TABLE "credit_requests" ADD COLUMN     "fichaCadastralMotivo" TEXT,
ADD COLUMN     "fichaCadastralRevisadaEm" TIMESTAMP(3),
ADD COLUMN     "fichaCadastralSituacao" "FichaCadastralSituacao" NOT NULL DEFAULT 'EM_ANALISE';

-- CreateTable
CREATE TABLE "document_pendencies" (
    "id" TEXT NOT NULL,
    "creditRequestId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "markedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_pendencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "document_pendencies_creditRequestId_idx" ON "document_pendencies"("creditRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "document_pendencies_creditRequestId_type_key" ON "document_pendencies"("creditRequestId", "type");

-- AddForeignKey
ALTER TABLE "document_pendencies" ADD CONSTRAINT "document_pendencies_creditRequestId_fkey" FOREIGN KEY ("creditRequestId") REFERENCES "credit_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_pendencies" ADD CONSTRAINT "document_pendencies_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

