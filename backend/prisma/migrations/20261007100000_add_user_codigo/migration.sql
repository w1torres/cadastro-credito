-- AlterTable
ALTER TABLE "users" ADD COLUMN     "codigo" TEXT;

-- CreateIndex
CREATE INDEX "users_codigo_idx" ON "users"("codigo");

