import { prisma } from "./prisma.js";


BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function main() {
  console.log("🌱 Seeding...");
  // 여기서 Group / Participant / Record / Badge 기준으로 seed 작성
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
