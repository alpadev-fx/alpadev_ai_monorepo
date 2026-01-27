import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Starting database reset...");

  // Delete in order to respect dependencies if any (though Mongo is loose)
  // But cleaner to delete dependent data first usually.
  
  await prisma.booking.deleteMany();
  console.log("Deleted Bookings");
  
  await prisma.transaction.deleteMany();
  console.log("Deleted Transactions");
  
  await prisma.bill.deleteMany();
  console.log("Deleted Bills");
  
  await prisma.invoice.deleteMany();
  console.log("Deleted Invoices");
  
  await prisma.request.deleteMany();
  console.log("Deleted Requests");
  
  await prisma.account.deleteMany();
  console.log("Deleted Accounts");
  
  await prisma.session.deleteMany();
  console.log("Deleted Sessions");
  
  await prisma.newsletterSubscriber.deleteMany();
  console.log("Deleted NewsletterSubscribers");

  await prisma.user.deleteMany();
  console.log("Deleted Users");

  await prisma.verificationToken.deleteMany();
  console.log("Deleted VerificationTokens");

  console.log("✅ Database reset completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
