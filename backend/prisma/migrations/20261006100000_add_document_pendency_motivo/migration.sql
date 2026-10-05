-- CreateEnum
CREATE TYPE "DocumentPendencyMotivo" AS ENUM ('FALTANTE', 'ERRADO');

-- AlterTable
ALTER TABLE "document_pendencies" ADD COLUMN     "motivo" "DocumentPendencyMotivo" NOT NULL DEFAULT 'FALTANTE';

