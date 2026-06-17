/** Shared CMS content for the Yoga program page — used by seed and update scripts. */

const { HERO_PAYLOAD_BY_PAGE } = require("./hero-payload-defaults");

const YOGA_IMAGES = {
  hero: "/uploads/homepage/whatsapp-image-2026-05-25-at-5-54-18-pm-1779875333765-4f015402.jpg",
  practice: "/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-39-pm-1-1779835766135-a3024d9d.jpg",
  stillness: "/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-41-pm-1-1779835766177-a292040d.jpg",
  training: "/uploads/pages/whatsapp-image-2026-05-25-at-5-57-38-pm-1779799410893-26d78e7e.jpg",
};

const YOGA_PAGE_SECTIONS = [
  {
    sectionType: "HERO",
    title: "My Journey of Yoga",
    subtitle: "Inner practice",
    content:
      "At Nirvana Yoga, we honor yoga as a complete inner journey — not merely a physical practice, but a path towards awareness, balance, and connection.",
    imageUrl: YOGA_IMAGES.hero,
    imageAlt: "Quiet yoga practice at Nirvana Yoga",
    isPublished: true,
    layout: { sectionStyle: "warm", animationPreset: "rise" },
    payload: HERO_PAYLOAD_BY_PAGE.YOGA,
  },
  {
    sectionType: "CUSTOM_TEXT",
    title: "A path of awareness",
    subtitle: "Philosophy & presence",
    payload: {
      variant: "yoga-journey",
      introParagraphCount: 2,
      paragraphs: [
        "At Nirvana Yoga, we honor yoga as a complete inner journey — not merely a physical practice, but a path towards awareness, balance, and connection.",
        "Our teachings are rooted in traditional yogic wisdom while remaining accessible for modern life. Through asana, pranayama, meditation, and Yoga Nidra, we create practices that support the body, calm the mind, and deepen inner awareness.",
        "We believe yoga is not about performance or perfection.",
        "It is a mindful practice of presence, observation, and self-discovery.",
        "Each session is thoughtfully designed to cultivate harmony between body, breath, mind, and consciousness — allowing space for stillness, healing, clarity, and transformation.",
        "Alongside yoga, art becomes a meditative and creative expression of the inner self — helping expand awareness, intuition, and authentic flow.",
      ],
      sutraEnabled: true,
      sutra: {
        sanskrit: "अभ्यासवैराग्याभ्यां तन्निरोधः",
        transliteration: "Abhyāsa-vairāgyābhyāṁ tan-nirodhaḥ",
        translation: "The mind is steadied through consistent practice and non-attachment.",
        source: "Patanjali Yoga Sutra 1.12",
        enabled: true,
      },
    },
    isPublished: true,
    layout: { sectionStyle: "muted", textAlignment: "center" },
  },
  {
    sectionType: "IMAGE_TEXT",
    title: "Traditional roots, modern life",
    subtitle: "Practice",
    content:
      "Through asana, pranayama, meditation, and Yoga Nidra, we weave practices that support the body, calm the mind, and deepen inner awareness — honoring the Bihar School tradition while meeting the rhythms of everyday life.",
    imageUrl: YOGA_IMAGES.practice,
    imageAlt: "Yoga Nidra teacher training — rest and presence",
    isPublished: true,
    layout: { sectionStyle: "default", imageSide: "left", animationPreset: "rise" },
  },
  {
    sectionType: "CUSTOM_TEXT",
    title: "Pathways of practice",
    subtitle: "What we offer",
    payload: {
      paragraphs: [
        "Yoga Asana — mindful movement that honors the body, not performance.",
        "Pranayama (Breathwork) — conscious breath to calm the nervous system and deepen awareness.",
        "Meditation — practices of presence, observation, and self-discovery.",
        "Yoga Nidra — deep relaxation and conscious rest for healing and clarity.",
      ],
    },
    isPublished: true,
  },
  {
    sectionType: "IMAGE_TEXT",
    title: "Stillness & transformation",
    subtitle: "Each session",
    content:
      "Every gathering is thoughtfully designed to cultivate harmony between body, breath, mind, and consciousness — allowing space for stillness, healing, clarity, and transformation.",
    imageUrl: YOGA_IMAGES.stillness,
    imageAlt: "Yoga practice — calm and grounded presence",
    isPublished: true,
    layout: { sectionStyle: "warm", imageSide: "right", animationPreset: "rise" },
  },
  {
    sectionType: "CUSTOM_TEXT",
    title: "Yoga Nidra Teachers Training",
    subtitle: "Deepen your teaching",
    payload: {
      paragraphs: [
        "An 11-hour Yoga Nidra Teachers Training Course available in English and Japanese.",
        "Japanese course: 8th and 15th July at the local studio — online and offline both available.",
        "For the English online course, please enquire by email.",
        "Yoga Sutra & philosophy sessions: 8-hour course in English — 18th & 25th August.",
      ],
    },
    isPublished: true,
    layout: { sectionStyle: "muted" },
  },
  {
    sectionType: "IMAGE_TEXT",
    title: "Teacher training in practice",
    content:
      "Yoga Nidra training invites rest, presence, and the art of guiding others into conscious relaxation — a profound practice for healing, clarity, and nervous system restoration.",
    imageUrl: YOGA_IMAGES.training,
    imageAlt: "Yoga Nidra teachers training session",
    isPublished: true,
    layout: { imageSide: "left" },
  },
  {
    sectionType: "GALLERY",
    title: "Moments from practice",
    subtitle: "Yoga Nidra & training",
    payload: { images: [], carousel: true },
    isPublished: true,
    layout: { galleryStyle: "immersive" },
  },
  {
    sectionType: "EVENTS",
    title: "Weekly sessions & workshops",
    payload: { eventKind: "sessions", categories: ["YOGA"], limit: 6 },
    isPublished: true,
  },
  {
    sectionType: "EVENTS",
    title: "Retreats & immersions",
    subtitle: "India and beyond",
    payload: { eventKind: "retreats", limit: 4 },
    isPublished: true,
  },
  {
    sectionType: "TESTIMONIALS",
    title: "From our community",
    payload: { items: [] },
    isPublished: true,
  },
  {
    sectionType: "CONTACT",
    title: "Questions about classes or teacher training?",
    payload: { showForm: true, formSubject: "Yoga inquiry" },
    isPublished: true,
  },
];

module.exports = { YOGA_PAGE_SECTIONS, YOGA_IMAGES };
