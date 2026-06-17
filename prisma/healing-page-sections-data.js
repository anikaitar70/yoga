/** Shared CMS content for the Healing program page — used by seed and update scripts. */

const { HERO_PAYLOAD_BY_PAGE } = require("./hero-payload-defaults");

const HEALING_IMAGES = {
  hero: "/uploads/pages/whatsapp-image-2026-05-26-at-7-27-50-pm-1779867995733-5f8342f0.jpg",
  return: "/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-05-pm-1779835765397-8be8c0a8.jpg",
  innerCalling: "/uploads/gallery/whatsapp-image-2026-05-25-at-5-48-27-pm-1-1779835766018-fc81b581.jpg",
  transformation: "/uploads/gallery/whatsapp-image-2026-05-25-at-5-57-42-pm-1779835766239-9bc9bec4.jpg",
  service: "/uploads/gallery/whatsapp-image-2026-05-25-at-5-54-19-pm-1779835766374-891810a3.jpg",
};

const HEALING_PAGE_SECTIONS = [
  {
    sectionType: "HERO",
    title: "My Journey into Healing",
    subtitle: "Inner restoration",
    content:
      "I was first introduced to the word healing when I was just 15 years old, through learning Reiki healing — a path that would return to me years later in the most unexpected and transformative way.",
    imageUrl: HEALING_IMAGES.hero,
    imageAlt: "Calm healing and mindful presence at Nirvana Yoga",
    isPublished: true,
    layout: { sectionStyle: "warm", animationPreset: "rise" },
    payload: HERO_PAYLOAD_BY_PAGE.HEALING,
  },
  {
    sectionType: "CUSTOM_TEXT",
    title: "Where it began",
    subtitle: "A path reopened",
    payload: {
      variant: "healing-journey",
      introParagraphCount: 2,
      closingParagraphCount: 2,
      paragraphs: [
        "I was first introduced to the word healing when I was just 15 years old, through learning Reiki healing.",
        "At that age, I was too young to truly understand its depth, and over time I drifted away from the practice.",
        "Years later, in 2011, life brought me back to it in the most unexpected and transformative way.",
        "My son was diagnosed with an autoimmune disorder, and like any mother, I was devastated. I did everything possible to help him return to normal health.",
        "While consulting doctors and specialists, I also began exploring alternative therapies and holistic approaches that could support his healing journey.",
        "Somewhere during that difficult period, I remembered Reiki.",
        "That memory reopened a door within me. I began searching for professional healers, but at the same time, I felt a deep inner calling to learn and do something myself.",
        "I went on to study past life healing and continued learning many healing modalities over the years.",
        "Through this journey, I explored deeper dimensions of human existence — karma, the subconscious mind, emotional patterns, energetic blocks, remedies, awareness, and the connection between mind, body, and spirit.",
        "Within a year, my son recovered.",
        "But alongside his healing, something within me had also transformed.",
        "I did not suddenly feel like I had a magic wand in my hand, but I became far more centered, aware, and connected to myself. My intuition sharpened. My understanding of life deepened. Healing became not just a practice, but an inner journey of growth, clarity, surrender, and transformation.",
        "Once again, as destiny seemed to unfold naturally, I never intended to become a professional healer. But a friend who was struggling with serious health issues requested a healing session from me.",
        "Shortly afterward, she experienced remarkable improvement, and that became the beginning of my professional healing journey.",
        "Word slowly spread, and more people began coming for sessions.",
        "Over the last 15+ years as a professional healer, I have had the privilege of helping many people through different challenges in life — physical health issues, emotional struggles, relationship difficulties, financial blocks, stress, inner confusion, and personal transformation.",
        "Every individual carries their own story, pain, and potential for healing.",
        "My role has never been to “fix” people, but to guide, support, and help them reconnect with their own inner balance, awareness, and strength.",
        "Healing, to me, is not just about removing problems.",
        "It is about creating harmony within ourselves so we can live with greater clarity, peace, resilience, and purpose.",
      ],
      highlightsEnabled: true,
      highlights: [
        {
          afterIndex: 7,
          label: "The turning point",
          text: "Looking back now, I can say that was the turning point of my life.",
          enabled: true,
        },
        {
          afterIndex: 10,
          label: "Recovery & transformation",
          text: "Within a year, my son recovered. But alongside his healing, something within me had also transformed.",
          enabled: true,
        },
      ],
    },
    isPublished: true,
    layout: { sectionStyle: "muted", textAlignment: "center" },
  },
  {
    sectionType: "IMAGE_TEXT",
    title: "Life brought me back",
    subtitle: "2011",
    content:
      "When my son was diagnosed with an autoimmune disorder, I explored every path that could support his return to health — medical care alongside alternative therapies and holistic approaches. In that difficult season, the memory of Reiki returned.",
    imageUrl: HEALING_IMAGES.return,
    imageAlt: "Quiet moment of reflection and care",
    isPublished: true,
    layout: { sectionStyle: "warm", imageSide: "left", animationPreset: "rise" },
  },
  {
    sectionType: "IMAGE_TEXT",
    title: "An inner calling",
    subtitle: "Learning & growth",
    content:
      "That reopened door led me to study past life healing and many other modalities — exploring karma, the subconscious mind, emotional patterns, and the deep connection between mind, body, and spirit.",
    imageUrl: HEALING_IMAGES.innerCalling,
    imageAlt: "Healing practice — presence and inner awareness",
    isPublished: true,
    layout: { imageSide: "right", animationPreset: "rise" },
  },
  {
    sectionType: "IMAGE_TEXT",
    title: "Centered & aware",
    subtitle: "Personal transformation",
    content:
      "I became far more centered, aware, and connected to myself. My intuition sharpened. My understanding of life deepened. Healing became not just a practice, but an inner journey of growth, clarity, surrender, and transformation.",
    imageUrl: HEALING_IMAGES.transformation,
    imageAlt: "Calm restorative practice",
    isPublished: true,
    layout: { sectionStyle: "warm", imageSide: "left" },
  },
  {
    sectionType: "IMAGE_TEXT",
    title: "15+ years of service",
    subtitle: "Professional healing",
    content:
      "What began with a friend’s request grew into a calling. Over the last 15+ years, I have had the privilege of supporting people through physical health issues, emotional struggles, relationship difficulties, financial blocks, stress, and personal transformation.",
    imageUrl: HEALING_IMAGES.service,
    imageAlt: "Community gathering — healing and connection",
    isPublished: true,
    layout: { imageSide: "right" },
  },
  {
    sectionType: "CUSTOM_TEXT",
    title: "How I hold space",
    subtitle: "Our approach",
    payload: {
      paragraphs: [
        "Awareness & inner balance — integrating body, breath, and consciousness to support clarity and emotional balance.",
        "Holistic healing pathways — drawing on decades of study in mindfulness, psychology, Reiki, and energetic healing.",
        "Healing as inward practice — guiding you to reconnect with your own inner balance, awareness, and strength.",
      ],
    },
    isPublished: true,
  },
  {
    sectionType: "GALLERY",
    title: "Moments of stillness",
    subtitle: "Rest & presence",
    payload: { images: [], carousel: true },
    isPublished: true,
    layout: { galleryStyle: "immersive" },
  },
  {
    sectionType: "TESTIMONIALS",
    title: "Stories from our community",
    payload: { items: [] },
    isPublished: true,
  },
  {
    sectionType: "EVENTS",
    title: "Healing gatherings",
    payload: { eventKind: "sessions", categories: ["HEALING"], limit: 6 },
    isPublished: true,
  },
  {
    sectionType: "CONTACT",
    title: "Book a conversation",
    payload: { showForm: true, formSubject: "Healing inquiry" },
    isPublished: true,
  },
];

module.exports = { HEALING_PAGE_SECTIONS, HEALING_IMAGES };
