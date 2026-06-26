/** Japanese event copy — keyed by slug and by English title (live CMS slugs vary). */
export type JaEventPatch = {
  title?: string;
  description?: string;
  location?: string;
};

const INDIA_RETREAT: JaEventPatch = {
  title: "インド・リトリート",
  description:
    "インドでのリトリート — ヨガ、アーユルヴェーダ療法、ヨガニドラ、瞑想、文化体験。",
  location: "インド",
};

const YOGA_7AM: JaEventPatch = {
  title: "ヨガクラス（英語）— 木曜 7–8時 JST",
  description:
    "毎週木曜日、午前7:00–8:00（JST）。英語でのクラス — オンラインでご参加いただけます。",
  location: "オンライン・対面",
};

const YOGA_10AM: JaEventPatch = {
  title: "ヨガクラス（英語）— 木曜 10–11時 JST",
  description:
    "毎週木曜日、午前10:00–11:00（JST）。英語でのクラス — オンライン・対面の両方でご参加いただけます。",
  location: "オンライン・対面",
};

const YOGA_NIDRA_JA: JaEventPatch = {
  title: "ヨガニドラ（日本語）— 週間クラス",
  description:
    "毎週水曜・金曜の日本語ヨガニドラ。深いリラクゼーションと意識的な休息のためのクラスです。",
  location: "スタジオ",
};

const ART_SUMMER_CAMP: JaEventPatch = {
  title: "アート・サマーキャンプ",
  description:
    "2日間でキャンバス2枚を仕上げます。アクリル画。材料はすべて込みです。",
  location: "横浜・元町",
};

const YOGA_SUTRA: JaEventPatch = {
  title: "ヨガスートラと哲学のクラス",
  description:
    "パタンジャリのヨガスートラを学ぶ8時間の英語コース — 8月18日・25日。",
  location: "オンライン",
};

/** Canonical seed slugs */
export const JA_EVENTS_BY_SLUG: Record<string, JaEventPatch> = {
  "yoga-nidra-japanese-wednesday": YOGA_NIDRA_JA,
  "yoga-session-thursday-10am": YOGA_10AM,
  "yoga-session-thursday-7am": YOGA_7AM,
  "yoga-nidra-ayurveda-cooking-hiroshima": {
    title: "ヨガニドラとアーユルヴェーダ料理",
    description:
      "広島で開催する2日間のワークショップ。ヨガニドラとアーユルヴェーダ料理を織り交ぜたプログラム — 2026年5月30日・31日。",
    location: "広島、日本",
  },
  "india-retreat-tbd": INDIA_RETREAT,
  "yoga-nidra-tt-july": {
    title: "ヨガニドラ・ティーチャートレーニング",
    description:
      "11時間のヨガニドラ・ティーチャートレーニング（英語・日本語）。日本語コース：7月8日・15日（スタジオ・オンライン・対面）。英語オンラインコースはメールでお問い合わせください。",
    location: "スタジオ — オンライン・対面",
  },
  "yoga-sutra-philosophy-august": YOGA_SUTRA,
  // Live CMS slugs (admin-entered)
  "Rejuvenation, Therapy, Lifestyle": INDIA_RETREAT,
  "Asana ,Pranayama, Bandha, Meditation": YOGA_7AM,
  "Joy of creativity ": ART_SUMMER_CAMP,
  "Deep realxation session with Pranayama and Asana": YOGA_NIDRA_JA,
  "Learn Yoga Sutra and philosophy": YOGA_SUTRA,
};

/** Fallback when slug was customized in the CMS */
export const JA_EVENTS_BY_TITLE: Record<string, JaEventPatch> = {
  "India Retreat": INDIA_RETREAT,
  "Yoga Session (English) — Thursday 7–8 am JST": YOGA_7AM,
  "Yoga Session (English) — Thursday 10–11 am JST": YOGA_10AM,
  "Yoga Nidra (Japanese) — Weekly": YOGA_NIDRA_JA,
  "Art Summer Camp": ART_SUMMER_CAMP,
  "Yoga Sutra & Philosophy Sessions": YOGA_SUTRA,
};

export function lookupJaEventPatch(event: {
  slug: string;
  title: string;
}): JaEventPatch | undefined {
  return (
    JA_EVENTS_BY_SLUG[event.slug] ??
    JA_EVENTS_BY_TITLE[event.title.trim()] ??
    undefined
  );
}
