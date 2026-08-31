-- Add the missing PAGE section type used by CTA buttons.
ALTER TYPE "PageSectionType" ADD VALUE IF NOT EXISTS 'BUTTON';
