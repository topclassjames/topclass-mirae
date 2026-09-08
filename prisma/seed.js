// Creates the first admin account if none exists yet.
// Usage: DATABASE_URL=... node prisma/seed.js [username] [password] [name]
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2] || "admin";
  const password = process.argv[3] || "changeme123";
  const name = process.argv[4] || "관리자";

  const existing = await prisma.staff.findUnique({ where: { username } });
  if (existing) {
    console.log(`이미 존재하는 계정입니다: ${username}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const staff = await prisma.staff.create({
    data: { username, passwordHash, name, role: "ADMIN" },
  });

  console.log("관리자 계정 생성 완료:", staff.username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
