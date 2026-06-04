-- CreateTable
CREATE TABLE "ContactFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ContactFeedback_createdAt_idx" ON "ContactFeedback"("createdAt");
