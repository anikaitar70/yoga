-- BlogPost.jaLocale for CMS Japanese copy when jaTranslationStatus is HUMAN_REVIEWED
ALTER TABLE "BlogPost" ADD COLUMN IF NOT EXISTS "jaLocale" JSONB;
