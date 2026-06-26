/** Japanese UI chrome — footer, forms, empty states, events. */
export const JA_UI = {
  explore: "サイトマップ",
  newsletterEyebrow: "ニュースレター",
  newsletterBlurb: "季節のお知らせとリトリート情報をお届けします。",
  newsletterTitle: "スタジオからの便り",
  newsletterSubtitle: "クラス、ワークショップ、静かなご案内を月一回お届けします。",
  newsletterPlaceholder: "メールアドレス",
  newsletterSubmit: "登録する",
  contactEyebrow: "お問い合わせ",
  viewAllEvents: "すべてのイベントを見る",
  viewAllGallery: "ギャラリーを見る",
  readFullStory: "シャリニのストーリーを読む",
  openMenu: "メニューを開く",
  closeMenu: "メニューを閉じる",
  languageLabel: "言語",
  viewFullCalendar: "すべてのイベントを見る →",
  featured: "注目",
  reserveSpot: "予約する",
  inquireRetreat: "リトリートについて問い合わせる",
  noUpcomingEvents: "今後のイベントはありません",
  noUpcomingEventsDesc: "ワークショップ、イマージョン、スタジオの集いについては、またご確認ください。",
  contactStudio: "スタジオに連絡する",
  visitContactPage: "お問い合わせページへ",
  eventsAriaLabel: "イベント",
  formName: "お名前",
  formEmail: "メールアドレス",
  formPhone: "電話番号",
  formContactMethod: "ご希望の連絡方法",
  formMessage: "メッセージ",
  formSubmit: "送信する",
  formSuccess: "ありがとうございます — メッセージを受け取りました。近日中にご返信いたします。",
  formError: "送信できませんでした。もう一度お試しください。",
  readMore: "続きを読む",
  backToBlog: "ブログ一覧へ",
} as const;

export type UiMessageKey = keyof typeof JA_UI;
