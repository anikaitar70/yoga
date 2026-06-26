import type { EventCategoryValue } from "@/lib/event-categories";
import type { Locale } from "@/lib/i18n/locale";
import { DEFAULT_LOCALE } from "@/lib/i18n/locale";
import { EVENT_CATEGORY_LABELS } from "@/lib/event-categories";

const JA_EVENT_CATEGORY_LABELS: Record<EventCategoryValue, string> = {
  YOGA: "ヨガ",
  YOGA_NIDRA: "ヨガニドラ",
  WORKSHOP: "ワークショップ",
  TEACHER_TRAINING: "ティーチャートレーニング",
  PHILOSOPHY: "哲学",
  HEALING: "ヒーリング",
  JUST_ART_LIFE: "ジャスト・アート・アフェア",
  RETREAT: "リトリート",
  RETREATS_AND_TOURS: "リトリート・ツアー",
};

export function eventCategoryLabel(locale: Locale, category: EventCategoryValue): string {
  if (locale === DEFAULT_LOCALE) return EVENT_CATEGORY_LABELS[category];
  return JA_EVENT_CATEGORY_LABELS[category] ?? EVENT_CATEGORY_LABELS[category];
}
