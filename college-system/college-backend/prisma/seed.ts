import { PrismaClient, Role, Gender, EmploymentType, Relationship, SubjectType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding College Management System Data...');

  // 1. TWO CAMPUSES
  const boysCampus = await prisma.campus.upsert({
    where: { code: 'BOYS' },
    update: {},
    create: {
      name: 'Boys Campus',
      code: 'BOYS',
      address: 'Main Road, Faisalabad'
    }
  });

  const girlsCampus = await prisma.campus.upsert({
    where: { code: 'GIRLS' },
    update: {},
    create: {
      name: 'Girls Campus',
      code: 'GIRLS',
      address: 'College Road, Faisalabad'
    }
  });

  // 2. THREE PROGRAMS (linked to Boys Campus)
  const fscPreMed = await prisma.program.upsert({
    where: { code_campusId: { code: 'FSPM', campusId: boysCampus.id } },
    update: {},
    create: {
      name: 'FSc Pre-Medical',
      code: 'FSPM',
      campusId: boysCampus.id,
      durationYears: 2
    }
  });

  const fscPreEng = await prisma.program.upsert({
    where: { code_campusId: { code: 'FSPE', campusId: boysCampus.id } },
    update: {},
    create: {
      name: 'FSc Pre-Engineering',
      code: 'FSPE',
      campusId: boysCampus.id,
      durationYears: 2
    }
  });

  const ics = await prisma.program.upsert({
    where: { code_campusId: { code: 'ICS', campusId: boysCampus.id } },
    update: {},
    create: {
      name: 'ICS',
      code: 'ICS',
      campusId: boysCampus.id,
      durationYears: 2
    }
  });

  // 3. TWO GRADES (linked to FSc Pre-Medical program)
  let part1 = await prisma.grade.findFirst({
    where: { name: 'Part 1', programId: fscPreMed.id }
  });
  if (!part1) {
    part1 = await prisma.grade.create({
      data: {
        name: 'Part 1',
        programId: fscPreMed.id,
        displayOrder: 1
      }
    });
  }

  let part2 = await prisma.grade.findFirst({
    where: { name: 'Part 2', programId: fscPreMed.id }
  });
  if (!part2) {
    part2 = await prisma.grade.create({
      data: {
        name: 'Part 2',
        programId: fscPreMed.id,
        displayOrder: 2
      }
    });
  }

  // 4. FIVE USERS (one per role)
  const plainPassword = 'Test@1234';
  const passwordHash = await bcrypt.hash(plainPassword, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'principal@college.edu.pk' },
    update: { passwordHash },
    create: {
      email: 'principal@college.edu.pk',
      passwordHash,
      role: Role.SUPER_ADMIN,
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@college.edu.pk' },
    update: { passwordHash },
    create: {
      email: 'admin@college.edu.pk',
      passwordHash,
      role: Role.ADMIN,
    }
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@college.edu.pk' },
    update: { passwordHash },
    create: {
      email: 'teacher@college.edu.pk',
      passwordHash,
      role: Role.TEACHER,
    }
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@college.edu.pk' },
    update: { passwordHash },
    create: {
      email: 'parent@college.edu.pk',
      passwordHash,
      role: Role.PARENT,
    }
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@college.edu.pk' },
    update: { passwordHash },
    create: {
      email: 'student@college.edu.pk',
      passwordHash,
      role: Role.STUDENT,
    }
  });

  // 5. TWO STAFF PROFILES
  // Principal Profile
  const principalProfile = await prisma.staffProfile.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: {
      userId: superAdmin.id,
      staffCode: 'EMP-001',
      firstName: 'Muhammad',
      lastName: 'Ali Khan',
      gender: Gender.MALE,
      designation: 'Principal',
      employmentType: EmploymentType.PERMANENT
    }
  });

  // Teacher Profile
  const teacherProfile = await prisma.staffProfile.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
      userId: teacher.id,
      staffCode: 'EMP-002',
      firstName: 'Ahmed',
      lastName: 'Raza',
      gender: Gender.MALE,
      designation: 'Lecturer',
      employmentType: EmploymentType.PERMANENT
    }
  });

  // 6. ONE STAFF CAMPUS ASSIGNMENT
  await prisma.staffCampusAssignment.upsert({
    where: {
      staffId_campusId: {
        staffId: teacherProfile.id,
        campusId: boysCampus.id
      }
    },
    update: {},
    create: {
      staffId: teacherProfile.id,
      campusId: boysCampus.id,
      isPrimary: true
    }
  });

  // 7. ONE SECTION
  let sectionA = await prisma.section.findFirst({
    where: { gradeId: part1.id, name: 'A', roomNumber: 'Room-101' }
  });
  if (!sectionA) {
    sectionA = await prisma.section.create({
      data: {
        gradeId: part1.id,
        name: 'A',
        roomNumber: 'Room-101',
        capacity: 50
      }
    });
  }

  // 8. ONE STUDENT PROFILE
  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      rollNumber: '001',
      firstName: 'Bilal',
      lastName: 'Ahmed',
      gender: Gender.MALE,
      enrollmentDate: new Date('2024-08-01'),
      campusId: boysCampus.id,
      sectionId: sectionA.id
    }
  });

  // 9. ONE PARENT PROFILE + LINK
  const parentProfile = await prisma.parentProfile.upsert({
    where: { userId: parent.id },
    update: {},
    create: {
      userId: parent.id,
      firstName: 'Ahmed',
      lastName: 'Raza',
      phone: '03004444444'
    }
  });

  await prisma.studentParentLink.upsert({
    where: {
      studentId_parentId: {
        studentId: studentProfile.id,
        parentId: parentProfile.id
      }
    },
    update: {},
    create: {
      studentId: studentProfile.id,
      parentId: parentProfile.id,
      relationship: Relationship.FATHER,
      isPrimary: true
    }
  });

  // 10. THREE SUBJECTS
  const physics = await prisma.subject.upsert({
    where: { code: 'PHY' },
    update: {},
    create: {
      name: 'Physics',
      code: 'PHY',
      type: SubjectType.BOTH,
      creditHours: 4
    }
  });

  const chemistry = await prisma.subject.upsert({
    where: { code: 'CHEM' },
    update: {},
    create: {
      name: 'Chemistry',
      code: 'CHEM',
      type: SubjectType.BOTH,
      creditHours: 4
    }
  });

  const math = await prisma.subject.upsert({
    where: { code: 'MATH' },
    update: {},
    create: {
      name: 'Mathematics',
      code: 'MATH',
      type: SubjectType.THEORY,
      creditHours: 5
    }
  });

  // 11. ONE SECTION-SUBJECT-TEACHER ASSIGNMENT
  await prisma.sectionSubjectTeacher.upsert({
    where: {
      sectionId_subjectId_academicYear: {
        sectionId: sectionA.id,
        subjectId: physics.id,
        academicYear: '2024-2025'
      }
    },
    update: {},
    create: {
      sectionId: sectionA.id,
      subjectId: physics.id,
      staffId: teacherProfile.id,
      academicYear: '2024-2025'
    }
  });

  // 12. ONE FEE STRUCTURE
  await prisma.feeStructure.upsert({
    where: {
      programId_gradeId_academicYear: {
        programId: fscPreMed.id,
        gradeId: part1.id,
        academicYear: '2024-2025'
      }
    },
    update: {},
    create: {
      campusId: boysCampus.id,
      programId: fscPreMed.id,
      gradeId: part1.id,
      academicYear: '2024-2025',
      admissionFee: 2000,
      tuitionFee: 10000,
      examFee: 2000,
      miscFee: 1000,
      totalFee: 15000
    }
  });

  // 13. ONE APP VERSION
  await prisma.appVersion.upsert({
    where: {
      platform_version: {
        platform: 'android',
        version: '1.0.0'
      }
    },
    update: {},
    create: {
      platform: 'android',
      version: '1.0.0',
      buildNumber: 100,
      releaseNotes: 'Initial release',
      isForced: false,
      isActive: true
    }
  });

  console.log('\n--- TEST CREDENTIALS ---');
  console.log('Password for all users: Test@1234');
  console.log('SUPER_ADMIN : principal@college.edu.pk');
  console.log('ADMIN       : admin@college.edu.pk');
  console.log('TEACHER     : teacher@college.edu.pk');
  console.log('PARENT      : parent@college.edu.pk');
  console.log('STUDENT     : student@college.edu.pk');
  console.log('--------------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
