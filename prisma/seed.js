const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "admin@nirvana-yoga.example" },
    update: {},
    create: {
      email: "admin@nirvana-yoga.example",
      name: "Nirvana Admin",
    },
  });

  for (const event of [
    {
      title: "Yoga Nidra (Japanese) — Weekly",
      slug: "yoga-nidra-japanese-wednesday",
      description:
        "Weekly Yoga Nidra session in Japanese. Every Wednesday, 1:30 pm at the local studio — deep relaxation and conscious rest.",
      location: "Local studio",
      startsAt: new Date("2026-06-10T04:30:00.000Z"),
      endsAt: new Date("2026-06-10T05:30:00.000Z"),
      category: "YOGA_NIDRA",
      isFeatured: true,
      published: true,
    },
    {
      title: "Yoga Session (English) — Thursday 10–11 am JST",
      slug: "yoga-session-thursday-10am",
      description:
        "Weekly yoga session every Thursday, 10:00–11:00 am JST. English — available online and offline.",
      location: "Online & offline",
      startsAt: new Date("2026-06-11T01:00:00.000Z"),
      endsAt: new Date("2026-06-11T02:00:00.000Z"),
      category: "YOGA",
      isFeatured: true,
      published: true,
    },
    {
      title: "Yoga Session (English) — Thursday 7–8 am JST",
      slug: "yoga-session-thursday-7am",
      description:
        "Weekly yoga session every Thursday, 7:00–8:00 am JST. English — available online and offline.",
      location: "Online & offline",
      startsAt: new Date("2026-06-11T22:00:00.000Z"),
      endsAt: new Date("2026-06-11T23:00:00.000Z"),
      category: "YOGA",
      isFeatured: true,
      published: true,
    },
    {
      title: "Yoga Nidra & Ayurveda Cooking",
      slug: "yoga-nidra-ayurveda-cooking-hiroshima",
      description:
        "A two-day workshop weaving Yoga Nidra with Ayurveda cooking in Hiroshima, Japan — 30 & 31 May 2026.",
      location: "Hiroshima, Japan",
      startsAt: new Date("2026-05-30T00:00:00.000Z"),
      endsAt: new Date("2026-05-31T14:00:00.000Z"),
      category: "WORKSHOP",
      isFeatured: true,
      published: true,
    },
    {
      title: "India Retreat",
      slug: "india-retreat-tbd",
      description:
        "Retreat in India — yoga, pranayama, meditation, Yoga Nidra, and Ayurveda therapies. Dates TBD.",
      location: "India",
      startsAt: new Date("2026-11-01T00:00:00.000Z"),
      endsAt: null,
      category: "RETREAT",
      isFeatured: true,
      published: true,
    },
    {
      title: "Yoga Nidra Teachers Training Course",
      slug: "yoga-nidra-tt-july",
      description:
        "11-hour Yoga Nidra Teachers Training Course — available in English & Japanese. Japanese sessions on 8 & 15 July at the local studio (online and offline). For the English online course, please email us.",
      location: "Local studio — online & offline",
      startsAt: new Date("2026-07-08T01:00:00.000Z"),
      endsAt: new Date("2026-07-15T10:00:00.000Z"),
      category: "TEACHER_TRAINING",
      isFeatured: true,
      published: true,
    },
    {
      title: "Yoga Sutra & Philosophy Sessions",
      slug: "yoga-sutra-philosophy-august",
      description:
        "8-hour course in English exploring Patanjali's Yoga Sutras — sessions on 18 & 25 August.",
      location: "Online",
      startsAt: new Date("2026-08-18T01:00:00.000Z"),
      endsAt: new Date("2026-08-25T10:00:00.000Z"),
      category: "PHILOSOPHY",
      isFeatured: true,
      published: true,
    },
  ]) {
    const { slug, ...data } = event;
    await prisma.event.upsert({
      where: { slug },
      update: data,
      create: { slug, ...data },
    });
  }

  await prisma.blogPost.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Beginner’s Guide to Conscious Breathing",
        slug: "beginners-guide-conscious-breathing",
        summary: "Learn simple breath practices to reduce stress and support focus.",
        content: "Breathwork is the foundation of grounded and mindful yoga practice...",
        coverImageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
        tags: ["breath", "beginner"],
        published: true,
      },
      {
        title: "How to Choose the Right Yoga Class for You",
        slug: "choose-right-yoga-class",
        summary: "A practical guide to matching your goals with the right style and pace.",
        content: "Whether you are new to yoga or returning after a break, selecting the right class matters...",
        coverImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        tags: ["community", "practice"],
        published: true,
      },
    ],
  });

  const heroSubtitle =
    "At Nirvana Yoga, we offer yoga asana, pranayama (breathwork), meditation, and Yoga Nidra through an authentic and mindful approach. We believe yoga is not a performance. Every session is thoughtfully designed to create balance between body, breath, mind, and inner awareness.";

  await prisma.heroSection.upsert({
    where: { id: "hero" },
    update: {
      title: "Rooted in Tradition. Guided by Presence.",
      subtitle: heroSubtitle,
      primaryCtaLabel: "Explore yoga",
      primaryCtaHref: "/yoga",
      secondaryCtaLabel: "Sessions & workshops",
      secondaryCtaHref: "/events",
      imageSrc:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80",
      imageAlt: "Shalini Gupta guiding yoga practice",
    },
    create: {
      id: "hero",
      title: "Rooted in Tradition. Guided by Presence.",
      subtitle: heroSubtitle,
      primaryCtaLabel: "Explore yoga",
      primaryCtaHref: "/yoga",
      secondaryCtaLabel: "Sessions & workshops",
      secondaryCtaHref: "/events",
      imageSrc:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80",
      imageAlt: "Shalini Gupta guiding yoga practice",
    },
  });

  await prisma.aboutPage.upsert({
    where: { id: "about" },
    update: {
      eyebrow: "About",
      title: "About Shalini Gupta",
      subtitle:
        "Yoga practitioner, meditation teacher, and wellness facilitator — bridging ancient wisdom with modern understanding.",
      imageSrc:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&q=80",
      imageAlt: "Shalini Gupta — yoga teacher and wellness facilitator",
      paragraphs: [
        "Shalini Gupta is a yoga practitioner/teacher, meditation teacher, and wellness facilitator with over 25 years of experience in yoga, mindfulness, and inner awareness practices.",
        "Raised in a family rooted in traditional yogic teachings in India, she studied both the academic and experiential dimensions of yoga at a renowned yoga university in India. Her path later expanded into healings, mindfulness, human psychology, and holistic well-being.",
        "Her teaching approach integrates body, breath, awareness, and conscious living — guiding people toward balance, clarity, relaxation, and deeper connection with themselves.",
        "Shalini has worked with students from diverse cultures and age groups around the world, supporting physical, mental, and emotional well-being through authentic traditional practices.",
        "She received extensive training at the renowned Bihar School of Yoga, whose teachings form a strong foundation of her practice and teaching style.",
        "Alongside yoga, Shalini also works with art and holistic healing practices as pathways for self-expression, inner awareness, and transformation.",
        "Her work bridges ancient wisdom with modern understanding, offering practices that are both authentic and accessible for contemporary life.",
      ],
    },
    create: {
      id: "about",
      eyebrow: "About",
      title: "About Shalini Gupta",
      subtitle:
        "Yoga practitioner, meditation teacher, and wellness facilitator — bridging ancient wisdom with modern understanding.",
      imageSrc:
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&q=80",
      imageAlt: "Shalini Gupta — yoga teacher and wellness facilitator",
      paragraphs: [
        "Shalini Gupta is a yoga practitioner/teacher, meditation teacher, and wellness facilitator with over 25 years of experience in yoga, mindfulness, and inner awareness practices.",
        "Raised in a family rooted in traditional yogic teachings in India, she studied both the academic and experiential dimensions of yoga at a renowned yoga university in India. Her path later expanded into healings, mindfulness, human psychology, and holistic well-being.",
        "Her teaching approach integrates body, breath, awareness, and conscious living — guiding people toward balance, clarity, relaxation, and deeper connection with themselves.",
        "Shalini has worked with students from diverse cultures and age groups around the world, supporting physical, mental, and emotional well-being through authentic traditional practices.",
        "She received extensive training at the renowned Bihar School of Yoga, whose teachings form a strong foundation of her practice and teaching style.",
        "Alongside yoga, Shalini also works with art and holistic healing practices as pathways for self-expression, inner awareness, and transformation.",
        "Her work bridges ancient wisdom with modern understanding, offering practices that are both authentic and accessible for contemporary life.",
      ],
    },
  });

  const defaultNavigation = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Yoga", href: "/yoga" },
    { label: "Just Art Affaire", href: "/just-art-life" },
    { label: "Healing", href: "/healing" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: {
      name: "Nirvana Yoga",
      tagline: "Rooted in tradition. Guided by presence.",
      contactEmail: "hello@nirvanayoga.studio",
      contactPhone: "",
      contactAddress: "Japan",
      navigation: defaultNavigation,
      social: {
        nirvanaYogaInstagram: "https://www.instagram.com/nirvanyog1/",
        justArtAffaireInstagram: "https://www.instagram.com/justartaffaire/",
      },
      branding: {
        nirvanaYoga: { logoSrc: "/brand/nirvana-yoga-logo.png", logoScale: 1 },
        justArtAffaire: { logoSrc: "/brand/just-art-affaire-logo.svg", logoScale: 1 },
      },
    },
    create: {
      id: "main",
      name: "Nirvana Yoga",
      tagline: "Rooted in tradition. Guided by presence.",
      contactEmail: "hello@nirvanayoga.studio",
      contactPhone: "",
      contactAddress: "Japan",
      navigation: defaultNavigation,
      social: {
        nirvanaYogaInstagram: "https://www.instagram.com/nirvanyog1/",
        justArtAffaireInstagram: "https://www.instagram.com/justartaffaire/",
      },
      branding: {
        nirvanaYoga: { logoSrc: "/brand/nirvana-yoga-logo.png", logoScale: 1 },
        justArtAffaire: { logoSrc: "/brand/just-art-affaire-logo.svg", logoScale: 1 },
      },
    },
  });

  // Community testimonials: run `npm run db:seed-testimonials` then `npm run db:ocr-testimonials`

  await prisma.galleryImage.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Golden Hour Practice",
        url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429",
        altText: "Yoga class at sunrise",
        description: "A calm studio session under warm morning light.",
        isPublished: true,
      },
    ],
  });

  await prisma.newsletterSubscriber.createMany({
    skipDuplicates: true,
    data: [
      {
        email: "studio@nirvana-yoga.example",
        name: "Nirvana Studio",
      },
    ],
  });

  await prisma.contactMessage.createMany({
    data: [
      {
        name: "Jamie Lee",
        email: "jamie@example.com",
        subject: "Workshop availability",
        message: "Hi team, I’d like to know when the next restorative workshop is scheduled.",
      },
    ],
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
