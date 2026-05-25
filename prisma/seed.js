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

  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        title: "Sunrise Vinyasa Flow",
        slug: "sunrise-vinyasa-flow",
        description: "A gentle morning practice designed to awaken the body and calm the mind.",
        location: "Nirvana Yoga Studio",
        startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
        price: 15,
        category: "YOGA",
        isFeatured: true,
        published: true,
      },
      {
        title: "Restorative Yin Evening",
        slug: "restorative-yin-evening",
        description: "Slow, supported poses for deep release and recovery.",
        location: "Nirvana Yoga Studio",
        startsAt: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 74).toISOString(),
        imageUrl: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f",
        price: 20,
        category: "HEALING",
        published: true,
      },
    ],
  });

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

  await prisma.heroSection.upsert({
    where: { id: "hero" },
    update: {
      title: "Stillness is a practice.",
      subtitle:
        "Yoga, art, and everyday rituals—held with warmth and clarity at Nirvana Yoga.",
      primaryCtaLabel: "View classes",
      primaryCtaHref: "/yoga",
      secondaryCtaLabel: "Upcoming events",
      secondaryCtaHref: "/events",
      imageSrc:
        "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1600&q=80",
      imageAlt: "Serene studio interior with natural textures",
    },
    create: {
      id: "hero",
      title: "Stillness is a practice.",
      subtitle:
        "Yoga, art, and everyday rituals—held with warmth and clarity at Nirvana Yoga.",
      primaryCtaLabel: "View classes",
      primaryCtaHref: "/yoga",
      secondaryCtaLabel: "Upcoming events",
      secondaryCtaHref: "/events",
      imageSrc:
        "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=1600&q=80",
      imageAlt: "Serene studio interior with natural textures",
    },
  });

  await prisma.aboutPage.upsert({
    where: { id: "about" },
    update: {
      eyebrow: "About",
      title: "Space for practice—not performance.",
      subtitle:
        "Nirvana Yoga began as a small circle seeking slower rhythms: breath-led classes, honest conversation, and room for beginners and longtime practitioners alike.",
      imageSrc:
        "https://images.unsplash.com/photo-1545389336-cf0906944358?w=1000&q=80",
      imageAlt: "Hands resting in meditation",
      paragraphs: [
        "Our teachers share lineage-informed sequencing without dogma. We teach alignment as inquiry—how your joints speak, how breath changes shape, when rest is the wisest edge.",
        "Alongside asana, we host gatherings that weave in ceramics, ink, poetry, and shared meals. Art here is not decoration; it is another language for showing up fully.",
        "Whether you arrive for sun salutations or Sunday sketching, you are invited to move at a humane pace—and to carry a little stillness back into your week.",
      ],
    },
    create: {
      id: "about",
      eyebrow: "About",
      title: "Space for practice—not performance.",
      subtitle:
        "Nirvana Yoga began as a small circle seeking slower rhythms: breath-led classes, honest conversation, and room for beginners and longtime practitioners alike.",
      imageSrc:
        "https://images.unsplash.com/photo-1545389336-cf0906944358?w=1000&q=80",
      imageAlt: "Hands resting in meditation",
      paragraphs: [
        "Our teachers share lineage-informed sequencing without dogma. We teach alignment as inquiry—how your joints speak, how breath changes shape, when rest is the wisest edge.",
        "Alongside asana, we host gatherings that weave in ceramics, ink, poetry, and shared meals. Art here is not decoration; it is another language for showing up fully.",
        "Whether you arrive for sun salutations or Sunday sketching, you are invited to move at a humane pace—and to carry a little stillness back into your week.",
      ],
    },
  });

  await prisma.siteConfig.upsert({
    where: { id: "main" },
    update: {
      name: "Nirvana Yoga",
      tagline: "Movement, stillness, and creative living.",
      contactEmail: "hello@nirvanayoga.studio",
      contactPhone: "+1 (503) 555-0142",
      contactAddress: "218 Willow Lane, Portland, OR",
      social: [
        { label: "Instagram", href: "https://instagram.com" },
        { label: "YouTube", href: "https://youtube.com" },
        { label: "Pinterest", href: "https://pinterest.com" },
      ],
    },
    create: {
      id: "main",
      name: "Nirvana Yoga",
      tagline: "Movement, stillness, and creative living.",
      contactEmail: "hello@nirvanayoga.studio",
      contactPhone: "+1 (503) 555-0142",
      contactAddress: "218 Willow Lane, Portland, OR",
      social: [
        { label: "Instagram", href: "https://instagram.com" },
        { label: "YouTube", href: "https://youtube.com" },
        { label: "Pinterest", href: "https://pinterest.com" },
      ],
    },
  });

  await prisma.testimonial.createMany({
    skipDuplicates: true,
    data: [
      {
        quote:
          "The studio feels like breath made visible—warm light, honest teaching, no performance.",
        name: "Maya Chen",
        role: "Designer & weekly practitioner",
        status: "APPROVED",
      },
      {
        quote:
          "I came for flexibility and stayed for the philosophy woven into every class.",
        name: "Jordan Ellis",
        role: "Teacher & parent",
        status: "APPROVED",
      },
      {
        quote:
          "Events here bridge yoga and art in a way that feels grounded, never trendy.",
        name: "Sofia Ruiz",
        role: "Painter",
        status: "APPROVED",
      },
    ],
  });

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
