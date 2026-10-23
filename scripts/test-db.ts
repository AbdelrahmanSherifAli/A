import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking DB connection...");
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true }
  });
  console.log("Found users:", users);
}

main()
  .catch((e) => {
    console.error("DB error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
