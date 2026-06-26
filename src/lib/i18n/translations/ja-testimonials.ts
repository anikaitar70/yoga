/** Japanese testimonial quotes keyed by id or display name. */
export type JaTestimonialPatch = {
  quote?: string;
  role?: string;
  city?: string;
  country?: string;
};

export const JA_TESTIMONIALS_BY_ID: Record<string, JaTestimonialPatch> = {
  "3033536f-aa44-4e94-96e4-e294e5a2fea8": {
    quote:
      "シャリニのアートクラスには何度も参加しましたが、いつもとても楽しく、インスピレーションに満ちた時間でした。制限的にならず、明確で役立つガイダンスをくれ、自分の創造性を探求し育てるお手伝いをしてくれます。自分が創った作品を毎日見るのが本当に嬉しいです。初心者の方にも経験者の方にも、シャリニのアートクラスを強くおすすめします。",
    role: "法律専門家／アーティスト",
    country: "ドイツ",
  },
};

export const JA_TESTIMONIALS_BY_NAME: Record<string, JaTestimonialPatch> = {
  Sabrina: JA_TESTIMONIALS_BY_ID["3033536f-aa44-4e94-96e4-e294e5a2fea8"]!,
  "Shreya Jaiswal": {
    quote:
      "ジャスト・アート・アフェアでの時間はとても楽しかったです。温かく歓迎してくれる雰囲気の中で、創造性を自由に表現できました。初心者でも安心して参加できるクラスです。",
    role: "起業家",
    city: "横浜",
    country: "日本",
  },
  "Jen A": {
    quote:
      "シャリニは素晴らしい先生です！アートクラスを本当に楽しみました。丁寧な指導と励ましのおかげで、自信を持って作品を仕上げることができました。",
    country: "アメリカ",
  },
  "Alina (mom)": {
    quote:
      "シャリニはとても責任感があり、献身的な先生です。子どもたちを丁寧に導いてくれ、美しい作品を創るお手伝いをしてくれました。",
    city: "横浜",
    country: "日本／中国",
  },
};

export function lookupJaTestimonialPatch(testimonial: {
  id: string;
  name?: string | null;
}): JaTestimonialPatch | undefined {
  const byId = JA_TESTIMONIALS_BY_ID[testimonial.id];
  if (byId) return byId;
  const name = testimonial.name?.trim();
  if (!name) return undefined;
  return JA_TESTIMONIALS_BY_NAME[name];
}
