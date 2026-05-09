-- CreateTable
CREATE TABLE "EventPendingApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "targetEventId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reason" TEXT,
    "startsAt" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "maxParticipants" INTEGER,
    "hostId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "serviceErrorReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventPendingApproval_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "EventPendingApproval_hostId_idx" ON "EventPendingApproval"("hostId");

-- CreateIndex
CREATE INDEX "EventPendingApproval_createdAt_idx" ON "EventPendingApproval"("createdAt");
