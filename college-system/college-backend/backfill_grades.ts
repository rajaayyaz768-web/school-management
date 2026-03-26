import prisma from "./src/config/database";

async function main() {
  const programs = await prisma.program.findMany({
    include: { grades: true }
  });

  let added = 0;
  for (const p of programs) {
    if (p.grades.length === 0) {
      console.log(`Adding default grades to program: ${p.name}`);
      await prisma.grade.createMany({
        data: [
          { name: "Part 1", displayOrder: 1, programId: p.id },
          { name: "Part 2", displayOrder: 2, programId: p.id }
        ]
      });
      added++;
    }
  }
  console.log(`Backfilled grades for ${added} programs.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
