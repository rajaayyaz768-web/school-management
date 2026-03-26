import prisma from "./src/config/database";
async function main() {
  const p = await prisma.program.findUnique({
    where: { id: "da477d18-7c57-4676-8a06-23fc84a638c0" },
    include: { campus: true }
  });
  console.log(JSON.stringify(p, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
