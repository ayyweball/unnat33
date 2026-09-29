-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "unnate_app";

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "age" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'en',
    "state" TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    "district" TEXT NOT NULL DEFAULT 'Lucknow',
    "lgdDistrictCode" TEXT,
    "isRural" BOOLEAN,
    "gender" TEXT,
    "socialCategory" TEXT,
    "isDifferentlyAbled" BOOLEAN,
    "isExServiceman" BOOLEAN,
    "isTraditionalArtisan" BOOLEAN,
    "isStreetVendor" BOOLEAN,
    "isStartup" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."Business" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sector" TEXT,
    "type" TEXT NOT NULL,
    "activity" TEXT,
    "stage" TEXT,
    "description" TEXT,
    "isNewBusiness" BOOLEAN,
    "estimatedCapital" DOUBLE PRECISION NOT NULL,
    "targetMonthlyIncome" DOUBLE PRECISION,
    "annualIncome" DOUBLE PRECISION,
    "annualTurnover" DOUBLE PRECISION,
    "monthlyIncome" DOUBLE PRECISION,
    "monthlyExpenses" DOUBLE PRECISION,
    "existingDebt" DOUBLE PRECISION,
    "existingMonthlyEmi" DOUBLE PRECISION,
    "projectCost" DOUBLE PRECISION,
    "requestedFinancing" DOUBLE PRECISION,
    "promoterContribution" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."Advisory" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "planJson" TEXT,
    "financialJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advisory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."SchemeMatch" (
    "id" TEXT NOT NULL,
    "advisoryId" TEXT NOT NULL,
    "schemeId" TEXT NOT NULL,
    "schemeName" TEXT NOT NULL,
    "eligibilityScore" DOUBLE PRECISION NOT NULL,
    "recommendedAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SchemeMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."Scheme" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ministry" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "loanMin" DOUBLE PRECISION NOT NULL,
    "loanMax" DOUBLE PRECISION NOT NULL,
    "eligibility" TEXT NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "tenure" INTEGER NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'all',
    "keywords" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."ProgressLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "actualIncome" DOUBLE PRECISION NOT NULL,
    "actualExpense" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."Report" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "advisoryId" TEXT,
    "pdfUrl" TEXT,
    "jsonData" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "unnate_app"."SharedLink" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "unnate_app"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Scheme_name_key" ON "unnate_app"."Scheme"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SharedLink_shareToken_key" ON "unnate_app"."SharedLink"("shareToken");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Business_userId_fkey') THEN
        ALTER TABLE "unnate_app"."Business" ADD CONSTRAINT "Business_userId_fkey" FOREIGN KEY ("userId") REFERENCES "unnate_app"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Advisory_businessId_fkey') THEN
        ALTER TABLE "unnate_app"."Advisory" ADD CONSTRAINT "Advisory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "unnate_app"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Advisory_userId_fkey') THEN
        ALTER TABLE "unnate_app"."Advisory" ADD CONSTRAINT "Advisory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "unnate_app"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SchemeMatch_advisoryId_fkey') THEN
        ALTER TABLE "unnate_app"."SchemeMatch" ADD CONSTRAINT "SchemeMatch_advisoryId_fkey" FOREIGN KEY ("advisoryId") REFERENCES "unnate_app"."Advisory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChatSession_userId_fkey') THEN
        ALTER TABLE "unnate_app"."ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "unnate_app"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ChatMessage_sessionId_fkey') THEN
        ALTER TABLE "unnate_app"."ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "unnate_app"."ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProgressLog_businessId_fkey') THEN
        ALTER TABLE "unnate_app"."ProgressLog" ADD CONSTRAINT "ProgressLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "unnate_app"."Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProgressLog_userId_fkey') THEN
        ALTER TABLE "unnate_app"."ProgressLog" ADD CONSTRAINT "ProgressLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "unnate_app"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Report_advisoryId_fkey') THEN
        ALTER TABLE "unnate_app"."Report" ADD CONSTRAINT "Report_advisoryId_fkey" FOREIGN KEY ("advisoryId") REFERENCES "unnate_app"."Advisory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'SharedLink_reportId_fkey') THEN
        ALTER TABLE "unnate_app"."SharedLink" ADD CONSTRAINT "SharedLink_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "unnate_app"."Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
