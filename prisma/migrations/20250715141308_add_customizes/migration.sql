-- CreateTable
CREATE TABLE "Customization" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "styles" JSONB NOT NULL,

    CONSTRAINT "Customization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customization_resumeId_templateName_key" ON "Customization"("resumeId", "templateName");

-- AddForeignKey
ALTER TABLE "Customization" ADD CONSTRAINT "Customization_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;
