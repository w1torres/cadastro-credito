-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CONSULTOR', 'GERENTE', 'CREDITO', 'ADMIN');

-- CreateEnum
CREATE TYPE "TimeInBusiness" AS ENUM ('MORE_THAN_10_YEARS', 'FROM_5_TO_10_YEARS', 'FROM_3_TO_5_YEARS', 'LESS_THAN_3_YEARS');

-- CreateEnum
CREATE TYPE "CreditRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED_TO_MANAGER', 'MANAGER_REVIEW', 'RETURNED_TO_CONSULTANT', 'SUBMITTED_TO_CREDIT', 'CREDIT_REVIEW', 'RETURNED_TO_MANAGER', 'APPROVED', 'REJECTED', 'SIGNATURE_PENDING', 'SIGNED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CONSULTOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "spouseName" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "relevantInfo" TEXT,
    "hasEasyRegistrationInfo" BOOLEAN NOT NULL,
    "timeInBusiness" "TimeInBusiness" NOT NULL,
    "hasCommercialReference" BOOLEAN NOT NULL,
    "commercialReferenceNotes" TEXT,
    "consultantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stateRegistration" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "ownAreaHectares" DECIMAL(10,2) NOT NULL,
    "leasedAreaHectares" DECIMAL(10,2) NOT NULL,
    "irrigatedAreaHectares" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_productions" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "harvestYear" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "hectares" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_requests" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "consultantId" TEXT NOT NULL,
    "requestedCreditLimit" DECIMAL(14,2) NOT NULL,
    "status" "CreditRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "leasedAreaPlanting" BOOLEAN NOT NULL DEFAULT false,
    "leasedAreaPlantingHectares" DECIMAL(10,2),
    "firstHarvestAreaPlanting" BOOLEAN NOT NULL DEFAULT false,
    "barterModality" BOOLEAN NOT NULL DEFAULT false,
    "hasRenegotiatedDebts" BOOLEAN NOT NULL DEFAULT false,
    "landAcquisition" BOOLEAN NOT NULL DEFAULT false,
    "landAcquisitionHectares" DECIMAL(10,2),
    "landAcquisitionYear" INTEGER,
    "landAcquisitionLocation" TEXT,
    "landAcquisitionInstallments" INTEGER,
    "newMachineryAcquisition" BOOLEAN NOT NULL DEFAULT false,
    "newMachineryDescription" TEXT,
    "otherActivity" BOOLEAN NOT NULL DEFAULT false,
    "otherActivityDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "clients_document_key" ON "clients"("document");

-- CreateIndex
CREATE INDEX "clients_consultantId_idx" ON "clients"("consultantId");

-- CreateIndex
CREATE INDEX "clients_createdAt_idx" ON "clients"("createdAt");

-- CreateIndex
CREATE INDEX "partners_clientId_idx" ON "partners"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "partners_clientId_document_key" ON "partners"("clientId", "document");

-- CreateIndex
CREATE INDEX "properties_clientId_idx" ON "properties"("clientId");

-- CreateIndex
CREATE INDEX "property_productions_propertyId_idx" ON "property_productions"("propertyId");

-- CreateIndex
CREATE INDEX "property_productions_harvestYear_idx" ON "property_productions"("harvestYear");

-- CreateIndex
CREATE UNIQUE INDEX "property_productions_propertyId_harvestYear_cropName_key" ON "property_productions"("propertyId", "harvestYear", "cropName");

-- CreateIndex
CREATE INDEX "credit_requests_status_idx" ON "credit_requests"("status");

-- CreateIndex
CREATE INDEX "credit_requests_clientId_idx" ON "credit_requests"("clientId");

-- CreateIndex
CREATE INDEX "credit_requests_consultantId_idx" ON "credit_requests"("consultantId");

-- CreateIndex
CREATE INDEX "credit_requests_createdAt_idx" ON "credit_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_productions" ADD CONSTRAINT "property_productions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_requests" ADD CONSTRAINT "credit_requests_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_requests" ADD CONSTRAINT "credit_requests_consultantId_fkey" FOREIGN KEY ("consultantId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
