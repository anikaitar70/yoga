-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "recurrenceDaysOfWeek" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

