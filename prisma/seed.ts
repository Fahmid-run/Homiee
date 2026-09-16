import bcrypt from "bcrypt";
import { Role } from "./generated/prisma/enums";
import { prisma } from "../src/lib/prisma";

import { configs } from "../src/config";

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const rawPassword = process.env.ADMIN_PASSWORD || "Admin@123456";

  const hashedPassword = await bcrypt.hash(
    rawPassword,
    Number(configs.bcrypt_salt_rounds),
  );

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      name: "Super Admin",
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
    },
  });

  console.log("✅ Admin user seeded successfully:", admin.email);
}

main()
  .catch((e) => {
    console.error(" Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
