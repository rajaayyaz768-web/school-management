import "dotenv/config";
import {
  PrismaClient,
  Role,
  Gender,
  Relationship,
  SubjectType,
  EmploymentType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...\n");

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CAMPUSES
  // ─────────────────────────────────────────────────────────────────────────
  console.log("Creating campuses...");

  const boysCampus = await prisma.campus.upsert({
    where: { code: "BOY" },
    update: {},
    create: {
      name: "Boys Campus",
      code: "BOY",
      address: "Main Road, Boys Wing, College Town",
      phone: "042-111-222-333",
    },
  });

  const girlsCampus = await prisma.campus.upsert({
    where: { code: "GIRL" },
    update: {},
    create: {
      name: "Girls Campus",
      code: "GIRL",
      address: "Main Road, Girls Wing, College Town",
      phone: "042-111-222-444",
    },
  });

  console.log(`  ✓ Boys Campus: ${boysCampus.id}`);
  console.log(`  ✓ Girls Campus: ${girlsCampus.id}`);

  // ─────────────────────────────────────────────────────────────────────────
  // 2. PROGRAMS (5 per campus = 10 total)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating programs...");

  const programDefs = [
    { name: "FSc Pre-Medical", code: "FSPM" },
    { name: "FSc Pre-Engineering", code: "FSPE" },
    { name: "ICS", code: "ICS" },
    { name: "ICom", code: "ICOM" },
    { name: "FA", code: "FA" },
  ];

  const boysPrograms: Record<string, { id: string }> = {};
  const girlsPrograms: Record<string, { id: string }> = {};

  for (const pd of programDefs) {
    const bp = await prisma.program.upsert({
      where: { code_campusId: { code: pd.code, campusId: boysCampus.id } },
      update: {},
      create: { ...pd, campusId: boysCampus.id },
    });
    boysPrograms[pd.code] = bp;

    const gp = await prisma.program.upsert({
      where: { code_campusId: { code: pd.code, campusId: girlsCampus.id } },
      update: {},
      create: { ...pd, campusId: girlsCampus.id },
    });
    girlsPrograms[pd.code] = gp;
  }

  console.log("  ✓ 5 programs each for Boys and Girls campuses (10 total)");

  // ─────────────────────────────────────────────────────────────────────────
  // 3. GRADES (Part 1 + Part 2 per program)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating grades...");

  const allProgramIds = [
    ...Object.values(boysPrograms),
    ...Object.values(girlsPrograms),
  ].map((p) => p.id);

  const gradesMap: Record<string, { p1: { id: string }; p2: { id: string } }> =
    {};

  for (const progId of allProgramIds) {
    const p1 = await prisma.grade.create({
      data: { name: "Part 1", programId: progId, displayOrder: 1 },
    });
    const p2 = await prisma.grade.create({
      data: { name: "Part 2", programId: progId, displayOrder: 2 },
    });
    gradesMap[progId] = { p1, p2 };
  }

  console.log(
    `  ✓ 2 grades per program (${allProgramIds.length * 2} total)`
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 4. SECTIONS (Section A + Section B per grade)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating sections...");

  const sectionsMap: Record<
    string,
    { a: { id: string }; b: { id: string } }
  > = {};

  for (const progId of allProgramIds) {
    for (const grade of [gradesMap[progId].p1, gradesMap[progId].p2]) {
      const secA = await prisma.section.create({
        data: { name: "Section A", gradeId: grade.id, capacity: 40 },
      });
      const secB = await prisma.section.create({
        data: { name: "Section B", gradeId: grade.id, capacity: 40 },
      });
      sectionsMap[grade.id] = { a: secA, b: secB };
    }
  }

  console.log("  ✓ Section A & B per grade");

  // ─────────────────────────────────────────────────────────────────────────
  // 5. USERS (one per role)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating test users...");

  const passwordHash = await bcrypt.hash("Admin@1234", 12);

  const principalUser = await prisma.user.upsert({
    where: { email: "principal@college.edu.pk" },
    update: {},
    create: {
      email: "principal@college.edu.pk",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@college.edu.pk" },
    update: {},
    create: {
      email: "admin@college.edu.pk",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@college.edu.pk" },
    update: {},
    create: {
      email: "teacher@college.edu.pk",
      passwordHash,
      role: Role.TEACHER,
    },
  });

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@college.edu.pk" },
    update: {},
    create: {
      email: "parent@college.edu.pk",
      passwordHash,
      role: Role.PARENT,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@college.edu.pk" },
    update: {},
    create: {
      email: "student@college.edu.pk",
      passwordHash,
      role: Role.STUDENT,
    },
  });

  console.log(
    "  ✓ 5 users (principal, admin, teacher, parent, student)"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 6. STAFF PROFILES
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating staff profiles...");

  const principalStaff = await prisma.staffProfile.upsert({
    where: { userId: principalUser.id },
    update: {},
    create: {
      userId: principalUser.id,
      staffCode: "STAFF-001",
      firstName: "Dr. Ahmed",
      lastName: "Khan",
      gender: Gender.MALE,
      phone: "0300-1111111",
      cnic: "35201-1111111-1",
      designation: "Principal",
      employmentType: EmploymentType.PERMANENT,
      joiningDate: new Date("2010-01-01"),
    },
  });

  const adminStaff = await prisma.staffProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      staffCode: "STAFF-002",
      firstName: "Bilal",
      lastName: "Hussain",
      gender: Gender.MALE,
      phone: "0301-2222222",
      cnic: "35201-2222222-2",
      designation: "Administrative Officer",
      employmentType: EmploymentType.PERMANENT,
      joiningDate: new Date("2015-03-15"),
    },
  });

  const teacherStaff = await prisma.staffProfile.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      staffCode: "STAFF-003",
      firstName: "Sara",
      lastName: "Malik",
      gender: Gender.FEMALE,
      phone: "0302-3333333",
      cnic: "35201-3333333-3",
      designation: "Lecturer",
      employmentType: EmploymentType.PERMANENT,
      joiningDate: new Date("2018-08-01"),
    },
  });

  // Assign all staff to Boys Campus
  for (const staff of [principalStaff, adminStaff, teacherStaff]) {
    await prisma.staffCampusAssignment.upsert({
      where: {
        staffId_campusId: { staffId: staff.id, campusId: boysCampus.id },
      },
      update: {},
      create: { staffId: staff.id, campusId: boysCampus.id, isPrimary: true },
    });
  }

  console.log("  ✓ 3 staff profiles + campus assignments");

  // ─────────────────────────────────────────────────────────────────────────
  // 7. STUDENT PROFILES (10 in Boys Campus — FSc Pre-Med Part 1)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating student profiles...");

  const fspmP1Grade = gradesMap[boysPrograms["FSPM"].id].p1;
  const fspmSecA = sectionsMap[fspmP1Grade.id].a;
  const fspmSecB = sectionsMap[fspmP1Grade.id].b;

  const studentDefs = [
    { firstName: "Ali", lastName: "Ahmed", section: fspmSecA },
    { firstName: "Hassan", lastName: "Raza", section: fspmSecA },
    { firstName: "Usman", lastName: "Sheikh", section: fspmSecA },
    { firstName: "Hamza", lastName: "Tariq", section: fspmSecA },
    { firstName: "Zain", lastName: "Qureshi", section: fspmSecA },
    { firstName: "Saad", lastName: "Iqbal", section: fspmSecB },
    { firstName: "Bilal", lastName: "Chaudhry", section: fspmSecB },
    { firstName: "Omar", lastName: "Siddiqui", section: fspmSecB },
    { firstName: "Faisal", lastName: "Butt", section: fspmSecB },
    { firstName: "Daniyal", lastName: "Malik", section: fspmSecB },
  ];

  const createdStudents: { id: string }[] = [];

  for (let i = 0; i < studentDefs.length; i++) {
    const sd = studentDefs[i];
    const email =
      i === 0 ? "student@college.edu.pk" : `student${i + 1}@college.edu.pk`;

    const userRecord =
      i === 0
        ? studentUser
        : await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email, passwordHash, role: Role.STUDENT },
          });

    const sp = await prisma.studentProfile.upsert({
      where: { userId: userRecord.id },
      update: {},
      create: {
        userId: userRecord.id,
        rollNumber: `2024-BOY-FSPM-${String(i + 1).padStart(3, "0")}`,
        firstName: sd.firstName,
        lastName: sd.lastName,
        gender: Gender.MALE,
        sectionId: sd.section.id,
        campusId: boysCampus.id,
        dob: new Date("2006-06-15"),
        guardianPhone: `0300-${String(5000000 + i).slice(-7)}`,
      },
    });

    createdStudents.push(sp);
  }

  console.log(
    "  ✓ 10 student profiles in Boys Campus — FSc Pre-Med Part 1"
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 8. PARENT PROFILES (5 parents — one per first 5 students)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating parent profiles...");

  const parentDefs = [
    { firstName: "Mohammad", lastName: "Ahmed" },
    { firstName: "Usman", lastName: "Raza" },
    { firstName: "Tahir", lastName: "Sheikh" },
    { firstName: "Arif", lastName: "Tariq" },
    { firstName: "Khalid", lastName: "Qureshi" },
  ];

  const createdParents: { id: string }[] = [];

  for (let i = 0; i < parentDefs.length; i++) {
    const pd = parentDefs[i];
    const email =
      i === 0 ? "parent@college.edu.pk" : `parent${i + 1}@college.edu.pk`;

    const userRecord =
      i === 0
        ? parentUser
        : await prisma.user.upsert({
            where: { email },
            update: {},
            create: { email, passwordHash, role: Role.PARENT },
          });

    const pp = await prisma.parentProfile.upsert({
      where: { userId: userRecord.id },
      update: {},
      create: {
        userId: userRecord.id,
        firstName: pd.firstName,
        lastName: pd.lastName,
        phone: `0311-${String(6000000 + i).slice(-7)}`,
        cnic: `35201-${String(4000000 + i).padStart(7, "0")}-${i + 1}`,
        occupation: "Business",
      },
    });

    createdParents.push(pp);
  }

  console.log("  ✓ 5 parent profiles");

  // ─────────────────────────────────────────────────────────────────────────
  // 9. STUDENT-PARENT LINKS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nLinking parents to students...");

  for (let i = 0; i < createdParents.length; i++) {
    await prisma.studentParentLink.upsert({
      where: {
        studentId_parentId: {
          studentId: createdStudents[i].id,
          parentId: createdParents[i].id,
        },
      },
      update: {},
      create: {
        studentId: createdStudents[i].id,
        parentId: createdParents[i].id,
        relationship: Relationship.FATHER,
        isPrimary: true,
      },
    });
  }

  console.log("  ✓ 5 student-parent links");

  // ─────────────────────────────────────────────────────────────────────────
  // 10. SUBJECTS
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating subjects...");

  const subjectDefs = [
    { name: "Physics", code: "PHY", type: SubjectType.THEORY, creditHours: 4 },
    { name: "Chemistry", code: "CHEM", type: SubjectType.THEORY, creditHours: 4 },
    { name: "Biology", code: "BIO", type: SubjectType.THEORY, creditHours: 4 },
    { name: "Mathematics", code: "MATH", type: SubjectType.THEORY, creditHours: 4 },
    { name: "English", code: "ENG", type: SubjectType.THEORY, creditHours: 3 },
    { name: "Urdu", code: "URD", type: SubjectType.THEORY, creditHours: 3 },
    { name: "Computer Science", code: "CS", type: SubjectType.BOTH, creditHours: 3 },
    { name: "Pakistan Studies", code: "PKS", type: SubjectType.THEORY, creditHours: 2 },
  ];

  for (const sd of subjectDefs) {
    await prisma.subject.upsert({
      where: { code: sd.code },
      update: {},
      create: sd,
    });
  }

  console.log("  ✓ 8 subjects");

  // ─────────────────────────────────────────────────────────────────────────
  // 11. FEE STRUCTURE — FSc Pre-Med Part 1, Boys Campus, 2024-2025
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\nCreating fee structure...");

  await prisma.feeStructure.upsert({
    where: {
      programId_gradeId_academicYear: {
        programId: boysPrograms["FSPM"].id,
        gradeId: fspmP1Grade.id,
        academicYear: "2024-2025",
      },
    },
    update: {},
    create: {
      programId: boysPrograms["FSPM"].id,
      gradeId: fspmP1Grade.id,
      campusId: boysCampus.id,
      academicYear: "2024-2025",
      admissionFee: 5000,
      tuitionFee: 12000,
      examFee: 2000,
      miscFee: 1000,
      lateFeePerDay: 50,
      totalFee: 20000,
    },
  });

  console.log("  ✓ Fee structure — FSc Pre-Med Part 1 (2024-2025)");

  // ─────────────────────────────────────────────────────────────────────────
  // DONE
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n✅ Seeding complete!\n");
  console.log("─────────────────────────────────────────────────────");
  console.log("Test Credentials (all passwords: Admin@1234)");
  console.log("─────────────────────────────────────────────────────");
  console.log("  SUPER_ADMIN  principal@college.edu.pk");
  console.log("  ADMIN        admin@college.edu.pk");
  console.log("  TEACHER      teacher@college.edu.pk");
  console.log("  PARENT       parent@college.edu.pk");
  console.log("  STUDENT      student@college.edu.pk");
  console.log("─────────────────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
