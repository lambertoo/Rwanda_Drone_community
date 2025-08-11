-- CreateEnum
CREATE TYPE "public"."ApplicationFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'NUMBER', 'SELECT', 'RADIO', 'CHECKBOX', 'DATE', 'FILE', 'PARAGRAPH');

-- CreateEnum
CREATE TYPE "public"."ConditionOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'NOT_CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IS_EMPTY', 'IS_NOT_EMPTY');

-- CreateEnum
CREATE TYPE "public"."ConditionAction" AS ENUM ('SHOW', 'HIDE', 'REQUIRE', 'MAKE_OPTIONAL', 'ENABLE', 'DISABLE');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "public"."ApplicationForm" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Application Form',
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationFormField" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "public"."ApplicationFieldType" NOT NULL,
    "placeholder" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" JSONB,
    "validation" JSONB,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationFormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationFieldCondition" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "targetFieldId" TEXT NOT NULL,
    "operator" "public"."ConditionOperator" NOT NULL,
    "value" TEXT NOT NULL,
    "action" "public"."ConditionAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationFieldCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApplicationFieldSubmission" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicationFieldSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApplicationForm_opportunityId_key" ON "public"."ApplicationForm"("opportunityId");

-- AddForeignKey
ALTER TABLE "public"."ApplicationForm" ADD CONSTRAINT "ApplicationForm_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "public"."Opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationForm" ADD CONSTRAINT "ApplicationForm_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationFormField" ADD CONSTRAINT "ApplicationFormField_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."ApplicationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationFieldCondition" ADD CONSTRAINT "ApplicationFieldCondition_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "public"."ApplicationFormField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationSubmission" ADD CONSTRAINT "ApplicationSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."ApplicationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationSubmission" ADD CONSTRAINT "ApplicationSubmission_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationFieldSubmission" ADD CONSTRAINT "ApplicationFieldSubmission_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "public"."ApplicationSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApplicationFieldSubmission" ADD CONSTRAINT "ApplicationFieldSubmission_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "public"."ApplicationFormField"("id") ON DELETE CASCADE ON UPDATE CASCADE;
