-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IMPOSTO_RENDA', 'DOCUMENTACAO_PESSOAL', 'COMPROVANTE_ENDERECO', 'CONTRATO_SOCIAL', 'CERTIDAO_ONUS_FAZENDA', 'CONTRATO_ARRENDAMENTO', 'DRE', 'CAR', 'DOCUMENTACAO_SOCIOS', 'OUTROS');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('PENDING', 'SENT', 'VIEWED', 'SIGNED', 'DECLINED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "creditRequestId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "originalName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signature_requests" (
    "id" TEXT NOT NULL,
    "creditRequestId" TEXT NOT NULL,
    "clicksignEnvelopeId" TEXT NOT NULL,
    "status" "SignatureStatus" NOT NULL DEFAULT 'PENDING',
    "requestedById" TEXT NOT NULL,
    "signedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "signature_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signature_events" (
    "id" TEXT NOT NULL,
    "signatureRequestId" TEXT NOT NULL,
    "clicksignEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signature_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documents_storageKey_key" ON "documents"("storageKey");

-- CreateIndex
CREATE INDEX "documents_creditRequestId_idx" ON "documents"("creditRequestId");

-- CreateIndex
CREATE INDEX "documents_type_idx" ON "documents"("type");

-- CreateIndex
CREATE UNIQUE INDEX "signature_requests_clicksignEnvelopeId_key" ON "signature_requests"("clicksignEnvelopeId");

-- CreateIndex
CREATE INDEX "signature_requests_creditRequestId_idx" ON "signature_requests"("creditRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "signature_events_clicksignEventId_key" ON "signature_events"("clicksignEventId");

-- CreateIndex
CREATE INDEX "signature_events_signatureRequestId_idx" ON "signature_events"("signatureRequestId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_creditRequestId_fkey" FOREIGN KEY ("creditRequestId") REFERENCES "credit_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_requests" ADD CONSTRAINT "signature_requests_creditRequestId_fkey" FOREIGN KEY ("creditRequestId") REFERENCES "credit_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_requests" ADD CONSTRAINT "signature_requests_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "signature_events" ADD CONSTRAINT "signature_events_signatureRequestId_fkey" FOREIGN KEY ("signatureRequestId") REFERENCES "signature_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
