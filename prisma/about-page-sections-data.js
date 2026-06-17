/**
 * Default About page sections — sourced from aboutPageCopy, experienceTimeline, and yogaSutras.
 */
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&q=80";

const introParagraphs = [
  "Shalini Gupta is a yoga practitioner/teacher, meditation teacher, and wellness facilitator with over 25 years of experience in yoga, mindfulness, and inner awareness practices.",
  "Raised in a family rooted in traditional yogic teachings in India, she studied both the academic and experiential dimensions of yoga at a renowned yoga university in India. Her path later expanded into healings, mindfulness, human psychology, and holistic well-being.",
  "Her teaching approach integrates body, breath, awareness, and conscious living — guiding people toward balance, clarity, relaxation, and deeper connection with themselves.",
];

const continuedParagraphs = [
  "Shalini has worked with students from diverse cultures and age groups around the world, supporting physical, mental, and emotional well-being through authentic traditional practices.",
  "She received extensive training at the renowned Bihar School of Yoga, whose teachings form a strong foundation of her practice and teaching style.",
  "Alongside yoga, Shalini also works with art and holistic healing practices as pathways for self-expression, inner awareness, and transformation. Her approach creates spaces where creativity, mindfulness, and conscious living come together to support emotional balance, clarity, and deeper connection with the self.",
  "Her work bridges ancient wisdom with modern understanding, offering practices that are both authentic and accessible for contemporary life.",
];

const experienceTimelineItems = [
  {
    number: "Foundations",
    title: "Traditional roots in India",
    text: "Raised in a family rooted in traditional yogic teachings, with formal study at a renowned yoga university in India.",
  },
  {
    number: "Deepening",
    title: "Bihar School of Yoga",
    text: "Received extensive training at the renowned Bihar School of Yoga — a cornerstone of her practice and teaching style.",
  },
  {
    number: "25+ years",
    title: "Global teaching & healing",
    text: "Guided students from diverse cultures worldwide through yoga, mindfulness, psychology, and holistic well-being.",
  },
  {
    number: "Today",
    title: "Yoga, art & conscious living",
    text: "Integrates asana, pranayama, meditation, Yoga Nidra, art, and healing — creating spaces for awareness and transformation.",
  },
];

const philosophySutras = [
  {
    sanskrit: "योगश्चित्तवृत्तिनिरोधः",
    transliteration: "Yogaś citta-vṛtti-nirodhaḥ",
    translation: "Yoga is the stilling of the fluctuations of the mind.",
    source: "Patanjali Yoga Sutra 1.2",
    interpretation:
      "At Nirvana Yoga, we honor yoga as a complete inner journey — not merely a physical practice, but a path towards awareness, balance, and connection. Our teachings are rooted in traditional yogic wisdom while remaining accessible for modern life.",
  },
  {
    sanskrit: "अभ्यासवैराग्याभ्यां तन्निरोधः",
    transliteration: "Abhyāsa-vairāgyābhyāṁ tan-nirodhaḥ",
    translation: "The mind is steadied through consistent practice and non-attachment.",
    source: "Patanjali Yoga Sutra 1.12",
    interpretation:
      "We believe yoga is not about performance or perfection. It is a mindful practice of presence, observation, and self-discovery. Each session cultivates harmony between body, breath, mind, and consciousness.",
  },
];

function buildAboutPageSections({ imageSrc, imageAlt, paragraphs }) {
  const intro = paragraphs.slice(0, 3);
  const continued = paragraphs.slice(3);

  return [
    {
      sectionType: "IMAGE_TEXT",
      title: null,
      subtitle: null,
      content: (intro.length ? intro : introParagraphs).join("\n\n"),
      imageUrl: imageSrc || DEFAULT_IMAGE,
      imageAlt: imageAlt || "Shalini Gupta in meditation",
      isPublished: true,
      layout: { imageSide: "left", imageAspect: "compact" },
      payload: null,
    },
    {
      sectionType: "CUSTOM_TEXT",
      title: "Journey & experience",
      subtitle: null,
      content: null,
      imageUrl: null,
      imageAlt: null,
      isPublished: true,
      layout: null,
      payload: {
        variant: "experience-timeline",
        paragraphs: [],
        timeline: {
          enabled: true,
          mode: "manual",
          items: experienceTimelineItems,
        },
      },
    },
    {
      sectionType: "CUSTOM_TEXT",
      title: null,
      subtitle: null,
      content: (continued.length ? continued : continuedParagraphs).join("\n\n"),
      imageUrl: null,
      imageAlt: null,
      isPublished: true,
      layout: null,
      payload: {
        variant: "default",
        paragraphs: continued.length ? continued : continuedParagraphs,
      },
    },
    {
      sectionType: "CUSTOM_TEXT",
      title: "Teaching philosophy",
      subtitle: null,
      content: null,
      imageUrl: null,
      imageAlt: null,
      isPublished: true,
      layout: null,
      payload: {
        variant: "philosophy",
        paragraphs: [],
        sutras: philosophySutras,
      },
    },
  ];
}

module.exports = {
  DEFAULT_IMAGE,
  introParagraphs,
  continuedParagraphs,
  experienceTimelineItems,
  philosophySutras,
  buildAboutPageSections,
};
