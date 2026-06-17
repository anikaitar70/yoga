/**
 * Primary content source for Nirvana Yoga — real studio copy.
 * Used by fallbacks, seeds, and static section components.
 */

import { BRAND_NAME } from "@/lib/brand";

export const SITE_NAME = BRAND_NAME;

export const heroCopy = {
  title: "Rooted in Tradition. Guided by Presence.",
  subtitle:
    "At Nirvana Yoga, we offer yoga asana, pranayama (breathwork), meditation, and Yoga Nidra through an authentic and mindful approach. We believe yoga is not a performance. Every session is thoughtfully designed to create balance between body, breath, mind, and inner awareness.",
  body: "Through movement, stillness, breath, and deep relaxation, we create space for clarity, healing, and connection. Alongside yoga, art becomes a pathway for self-expression and inner exploration — helping you deepen your soul's connection and allow creativity to flow naturally.",
  primaryCta: { label: "Explore yoga", href: "/yoga" },
  secondaryCta: { label: "Sessions & workshops", href: "/events" },
  imageAlt: "Shalini Gupta guiding yoga practice",
};

export const aboutPreviewCopy = {
  heading: "About Shalini",
  body: "Shalini Gupta is a yoga practitioner, meditation teacher, and wellness facilitator with over 25 years of experience. Raised in a family rooted in traditional yogic teachings in India, her path expanded into healing, mindfulness, and holistic well-being — guiding people toward balance, clarity, and deeper connection with themselves.",
  highlights: [
    "25+ years in yoga, mindfulness & inner awareness",
    
    "Extensive training at the Bihar School of Yoga",
    "Students across cultures and age groups worldwide",
    "Art & holistic healing as pathways for transformation",
  ],
  linkLabel: "Read Shalini's full story",
  linkHref: "/about",
  imageAlt: "Shalini Gupta — yoga teacher and wellness facilitator",
};

export const aboutPageCopy = {
  eyebrow: "About",
  title: "About Shalini Gupta",
  subtitle:
    "Yoga practitioner, meditation teacher, and wellness facilitator — bridging ancient wisdom with modern understanding.",
  imageAlt: "Shalini Gupta in meditation",
  paragraphs: [
    "Shalini Gupta is a yoga practitioner/teacher, meditation teacher, and wellness facilitator with over 25 years of experience in yoga, mindfulness, and inner awareness practices.",
    "Raised in a family rooted in traditional yogic teachings in India, she studied both the academic and experiential dimensions of yoga at a renowned yoga university in India. Her path later expanded into healings, mindfulness, human psychology, and holistic well-being.",
    "Her teaching approach integrates body, breath, awareness, and conscious living — guiding people toward balance, clarity, relaxation, and deeper connection with themselves.",
    "Shalini has worked with students from diverse cultures and age groups around the world, supporting physical, mental, and emotional well-being through authentic traditional practices.",
    "She received extensive training at the renowned Bihar School of Yoga, whose teachings form a strong foundation of her practice and teaching style.",
    "Alongside yoga, Shalini also works with art and holistic healing practices as pathways for self-expression, inner awareness, and transformation. Her approach creates spaces where creativity, mindfulness, and conscious living come together to support emotional balance, clarity, and deeper connection with the self.",
    "Her work bridges ancient wisdom with modern understanding, offering practices that are both authentic and accessible for contemporary life.",
  ],
};

export const experienceTimeline = [
  {
    year: "Foundations",
    title: "Traditional roots in India",
    body: "Raised in a family rooted in traditional yogic teachings, with formal study at a renowned yoga university in India.",
  },
  {
    year: "Deepening",
    title: "Bihar School of Yoga",
    body: "Received extensive training at the renowned Bihar School of Yoga — a cornerstone of her practice and teaching style.",
  },
  {
    year: "25+ years",
    title: "Global teaching & healing",
    body: "Guided students from diverse cultures worldwide through yoga, mindfulness, psychology, and holistic well-being.",
  },
  {
    year: "Today",
    title: "Yoga, art & conscious living",
    body: "Integrates asana, pranayama, meditation, Yoga Nidra, art, and healing — creating spaces for awareness and transformation.",
  },
];

export type YogaSutraPassage = {
  sanskrit: string;
  transliteration: string;
  translation: string;
  source: string;
  interpretation: string;
};

export const yogaSutras: YogaSutraPassage[] = [
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

export const philosophyCopy = {
  heading: "Philosophy",
  closing:
    "Alongside yoga, art becomes a meditative and creative expression of the inner self — helping expand awareness, intuition, and authentic flow.",
};

export const yogaPathwayCopy = {
  eyebrow: "Practice",
  title: "Yoga",
  subtitle: "Asana, pranayama, meditation & Yoga Nidra.",
  description:
    "Through asana, pranayama, meditation, and Yoga Nidra, we create practices that support the body, calm the mind, and deepen inner awareness — rooted in tradition, accessible for modern life.",
  highlights: [
    "Yoga asana & mindful movement",
    "Pranayama (breathwork)",
    "Meditation & inner awareness",
    "Yoga Nidra — deep relaxation",
    "Yoga Nidra Teacher Training (English & Japanese)",
    "Yoga Sutra & philosophy courses",
  ],
  ctaLabel: "Explore yoga offerings",
  href: "/yoga",
};

export const healingPathwayCopy = {
  eyebrow: "Care",
  title: "Healing",
  subtitle: "Awareness, balance & holistic well-being.",
  description:
    "Shalini's path expanded into healing, mindfulness, and human psychology — offering supportive practices that nurture emotional balance, clarity, and deeper connection with the self.",
  highlights: [
    "Mindfulness & nervous system care",
    "Holistic healing pathways",
    "Emotional balance & inner awareness",
    "Personal, trust-centered approach",
    "Complementary to wider care teams",
  ],
  ctaLabel: "Discover healing pathways",
  href: "/healing",
};

export const artPathwayCopy = {
  eyebrow: "Creative life",
  title: "Just Art Affaire",
  subtitle: "Art as self-expression & inner exploration.",
  description:
    "Alongside yoga, art becomes a pathway for self-expression and inner exploration — helping you deepen your soul's connection and allow creativity to flow naturally.",
  highlights: [
    "Art as meditative expression",
    "Creativity & awareness together",
    "Gallery-driven storytelling",
    "Workshops & creative gatherings",
  ],
  ctaLabel: "Enter the creative studio",
  href: "/just-art-life",
};

export const weeklySessions = [
  {
    day: "Wednesday",
    title: "Yoga Nidra (Japanese)",
    time: "1:30 PM",
    location: "Local studio",
    language: "Japanese",
  },
  {
    day: "Thursday",
    title: "Yoga session",
    time: "10:00 – 11:00 AM JST",
    location: "Online & offline",
    language: "English",
  },
  {
    day: "Thursday",
    title: "Yoga session",
    time: "7:00 – 8:00 AM JST",
    location: "Online & offline",
    language: "English",
  },
];

export const upcomingPrograms = [
  {
    type: "Workshop",
    title: "Yoga Nidra & Ayurveda Cooking",
    location: "Hiroshima, Japan",
    dates: "30–31 May 2026",
    href: "/events",
  },
  {
    type: "Teacher training",
    title: "Yoga Nidra Teachers Training Course",
    location: "Local studio — online & offline",
    dates: "11-hour course · English & Japanese",
    detail: "Japanese course: 8 & 15 July. English online course — enquire by email.",
    href: "/yoga",
  },
  {
    type: "Philosophy",
    title: "Yoga Sutra & Philosophy Sessions",
    location: "Online",
    dates: "8-hour course · 18 & 25 August",
    detail: "English language sessions.",
    href: "/yoga",
  },
  {
    type: "Retreat",
    title: "India Retreat",
    location: "India",
    dates: "Dates TBD",
    detail: "Yoga, pranayama, meditation, Yoga Nidra & Ayurveda therapies.",
    href: "/events/retreats-and-tours",
  },
];

export const yogaOfferings = [
  {
    id: "asana",
    title: "Yoga Asana",
    body: "Mindful movement that honors the body — not performance. Sessions are thoughtfully designed to create balance between body, breath, mind, and inner awareness.",
  },
  {
    id: "pranayama",
    title: "Pranayama (Breathwork)",
    body: "Conscious breath practices that calm the nervous system, deepen awareness, and support clarity in daily life.",
  },
  {
    id: "meditation",
    title: "Meditation",
    body: "Guided practices of presence and observation — cultivating stillness, self-discovery, and connection with inner awareness.",
  },
  {
    id: "yoga-nidra",
    title: "Yoga Nidra",
    body: "Deep relaxation and conscious rest — a profound practice for healing, clarity, and nervous system restoration.",
  },
];

export const yogaTrainingCopy = {
  title: "Yoga Nidra Teachers Training",
  paragraphs: [
    "An 11-hour Yoga Nidra Teachers Training Course available in both English and Japanese.",
    "Japanese course: 8th and 15th July at the local studio — online and offline both available.",
    "For the English online course, please enquire by email.",
    "Yoga Sutra & philosophy sessions: 8-hour course in English — 18th & 25th August.",
  ],
};

export const healingModalities = [
  {
    id: "awareness",
    title: "Awareness & inner balance",
    body: "Practices that integrate body, breath, and consciousness — supporting clarity, relaxation, and emotional balance through mindful presence.",
  },
  {
    id: "holistic",
    title: "Holistic healing pathways",
    body: "Drawing on 25+ years of study in mindfulness, human psychology, and holistic well-being — offering supportive guidance rooted in lived experience.",
  },
  {
    id: "integration",
    title: "Yoga & healing together",
    body: "Healing is understood as a long, inward practice. Sessions create space for stillness, transformation, and deeper connection with the self.",
  },
];

export const justArtLifeCopy = {
  eyebrow: "Creative life",
  title: "Just Art Affaire",
  subtitle: "Where creativity, mindfulness, and conscious living meet.",
  imageAlt: "Art and creative expression at Nirvana Yoga",
  paragraphs: [
    "Alongside yoga, art becomes a pathway for self-expression and inner exploration — helping you deepen your soul's connection and allow creativity to flow naturally.",
    "Art here is a meditative and creative expression of the inner self — expanding awareness, intuition, and authentic flow without pressure to perform or perfect.",
    "Pop-ups and gatherings pair gentle movement with open creative hours — breathwork, clay, ink, collage, and the quiet beauty of making something with your hands.",
    "Watch the gallery for seasonal showcases, workshop moments, and reflections from our creative community.",
  ],
};

export const pageIntroCopy = {
  yoga: {
    eyebrow: "Practice",
    title: "Yoga at Nirvana Yoga",
    subtitle:
      "Asana, pranayama, meditation, and Yoga Nidra — authentic traditional practices for modern life.",
  },
  healing: {
    eyebrow: "Care",
    title: "Healing & holistic well-being",
    subtitle:
      "Mindfulness, awareness, and supportive pathways — held with warmth, trust, and clarity of scope.",
  },
  events: {
    eyebrow: "Calendar",
    title: "Sessions, workshops & retreats",
    subtitle:
      "Weekly classes, Yoga Nidra training, philosophy courses, and upcoming immersions in Japan and India.",
  },
  gallery: {
    eyebrow: "Studio",
    title: "Gallery",
    subtitle: "Art, Yoga Nidra, workshops, healing, retreats — moments from our practice.",
  },
  contact: {
    eyebrow: "Connect",
    title: "Begin your journey",
    subtitle: "Questions about classes, teacher training, retreats, or healing — we welcome your message.",
  },
  blog: {
    eyebrow: "Journal",
    title: "Reflections",
    subtitle: "Yoga, art, healing, and the quiet rituals that hold a week together.",
  },
  justArtLife: {
    eyebrow: "Creative life",
    title: "Just Art Affaire",
    subtitle:
      "Art as self-expression and inner exploration — where creativity, mindfulness, and conscious living meet.",
  },
};
