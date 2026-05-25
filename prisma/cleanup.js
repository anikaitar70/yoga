const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Running database cleanup for legacy migration data...");

  const fixedEvents = await prisma.$executeRaw`
    UPDATE "Event"
    SET category = 'YOGA'
    WHERE category IS NULL
  `;

  const fixedTestimonials = await prisma.$executeRaw`
    UPDATE "Testimonial"
    SET status = 'APPROVED'
    WHERE status IS NULL
  `;

  if (fixedEvents > 0) {
    console.log(`Updated ${fixedEvents} legacy event record(s) to default category YOGA.`);
  } else {
    console.log("No legacy event categories required cleanup.");
  }

  if (fixedTestimonials > 0) {
    console.log(`Updated ${fixedTestimonials} legacy testimonial record(s) to default status APPROVED.`);
  } else {
    console.log("No legacy testimonial statuses required cleanup.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
