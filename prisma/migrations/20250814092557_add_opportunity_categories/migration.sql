-- CreateTable
CREATE TABLE "opportunity_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '💼',
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_categories_name_key" ON "opportunity_categories"("name");

-- AlterTable
ALTER TABLE "opportunities" ADD COLUMN "categoryId" TEXT;

-- AddForeignKey
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "opportunity_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE; 