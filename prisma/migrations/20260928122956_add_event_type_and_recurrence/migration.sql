-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('ONE_TIME', 'RECURRING', 'ON_REQUEST');

-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventType" "EventType" NOT NULL DEFAULT 'ONE_TIME',
ADD COLUMN     "recurrenceEndDate" TIMESTAMP(3),
ADD COLUMN     "recurrenceFrequency" "RecurrenceFrequency",
ADD COLUMN     "recurrencePauseEnd" TIMESTAMP(3),
ADD COLUMN     "recurrencePauseStart" TIMESTAMP(3);

