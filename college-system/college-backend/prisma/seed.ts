import {
  PrismaClient, Role, Gender, EmploymentType, Relationship, SubjectType,
  AttendanceStatus, StaffAttendanceStatus, FeeStatus, ExamStatus,
  DayOfWeek, SlotType, AnnouncementAudience
} from '@prisma/client';
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

  // 1b. PRIMARY SCHOOL CAMPUS (third campus for testing multi-campus breakdown)
  const primaryCampus = await prisma.campus.upsert({
    where: { code: 'PRI' },
    update: {},
    create: {
      name: 'Primary School',
      code: 'PRI',
      address: 'Junior Block, Faisalabad',
    },
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

  // 2b. PRIMARY SCHOOL PROGRAM + SAMPLE GRADES (Class 1–5)
  const primaryProgram = await prisma.program.upsert({
    where: { code_campusId: { code: 'PRIM', campusId: primaryCampus.id } },
    update: {},
    create: {
      name: 'Primary Education',
      code: 'PRIM',
      campusId: primaryCampus.id,
      durationYears: 5,
    },
  });

  for (let i = 1; i <= 5; i++) {
    const existing = await prisma.grade.findFirst({
      where: { name: `Class ${i}`, programId: primaryProgram.id },
    });
    if (!existing) {
      await prisma.grade.create({
        data: { name: `Class ${i}`, programId: primaryProgram.id, displayOrder: i },
      });
    }
  }

  // 4. FIVE + 1 USERS (one per role, plus a Girls Campus admin)
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

  const adminGirls = await prisma.user.upsert({
    where: { email: 'admin.girls@college.edu.pk' },
    update: { passwordHash },
    create: {
      email: 'admin.girls@college.edu.pk',
      passwordHash,
      role: Role.ADMIN,
    },
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

  // Admin Profile — Boys Campus (required so auth middleware resolves campusId for ADMIN role)
  const adminProfile = await prisma.staffProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      staffCode: 'EMP-003',
      firstName: 'Khalid',
      lastName: 'Mahmood',
      gender: Gender.MALE,
      designation: 'Campus Administrator',
      employmentType: EmploymentType.PERMANENT,
    },
  });

  // Admin Profile — Girls Campus
  const adminGirlsProfile = await prisma.staffProfile.upsert({
    where: { userId: adminGirls.id },
    update: {},
    create: {
      userId: adminGirls.id,
      staffCode: 'EMP-004',
      firstName: 'Fatima',
      lastName: 'Noor',
      gender: Gender.FEMALE,
      designation: 'Campus Administrator',
      employmentType: EmploymentType.PERMANENT,
    },
  });

  // 6. STAFF CAMPUS ASSIGNMENTS
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

  // Boys Campus admin assignment (isPrimary: true — required for campus scoping)
  await prisma.staffCampusAssignment.upsert({
    where: { staffId_campusId: { staffId: adminProfile.id, campusId: boysCampus.id } },
    update: {},
    create: { staffId: adminProfile.id, campusId: boysCampus.id, isPrimary: true },
  });

  // Girls Campus admin assignment (isPrimary: true)
  await prisma.staffCampusAssignment.upsert({
    where: { staffId_campusId: { staffId: adminGirlsProfile.id, campusId: girlsCampus.id } },
    update: {},
    create: { staffId: adminGirlsProfile.id, campusId: girlsCampus.id, isPrimary: true },
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

  // ─────────────────────────────────────────────────────────────────
  // ADDITIONS: fill missing seed data for feature testing
  // ─────────────────────────────────────────────────────────────────

  const ACADEMIC_YEAR = '2026-2027';

  // 10 weekday dates in March 2026
  const attendanceDates: Date[] = [2, 3, 4, 5, 6, 9, 10, 11, 12, 13].map(
    d => new Date(`2026-03-${d.toString().padStart(2, '0')}`)
  );

  // ── A. Principal campus assignment (was missing) ──────────────────

  await prisma.staffCampusAssignment.upsert({
    where: { staffId_campusId: { staffId: principalProfile.id, campusId: boysCampus.id } },
    update: {},
    create: { staffId: principalProfile.id, campusId: boysCampus.id, isPrimary: true }
  });

  // ── B. Grades for FSPE and ICS ──────────────────────────────────

  let fspePart1 = await prisma.grade.findFirst({ where: { name: 'Part 1', programId: fscPreEng.id } });
  if (!fspePart1) fspePart1 = await prisma.grade.create({ data: { name: 'Part 1', programId: fscPreEng.id, displayOrder: 1 } });

  let fspePart2 = await prisma.grade.findFirst({ where: { name: 'Part 2', programId: fscPreEng.id } });
  if (!fspePart2) fspePart2 = await prisma.grade.create({ data: { name: 'Part 2', programId: fscPreEng.id, displayOrder: 2 } });

  let icsPart1 = await prisma.grade.findFirst({ where: { name: 'Part 1', programId: ics.id } });
  if (!icsPart1) icsPart1 = await prisma.grade.create({ data: { name: 'Part 1', programId: ics.id, displayOrder: 1 } });

  let icsPart2 = await prisma.grade.findFirst({ where: { name: 'Part 2', programId: ics.id } });
  if (!icsPart2) icsPart2 = await prisma.grade.create({ data: { name: 'Part 2', programId: ics.id, displayOrder: 2 } });

  // ── C. Section B ─────────────────────────────────────────────────

  let sectionB = await prisma.section.findFirst({ where: { gradeId: part1.id, name: 'B' } });
  if (!sectionB) {
    sectionB = await prisma.section.create({
      data: { gradeId: part1.id, name: 'B', roomNumber: 'Room-102', capacity: 50 }
    });
  }

  // ── D. Two more students ─────────────────────────────────────────

  const student2User = await prisma.user.upsert({
    where: { email: 'student2@college.edu.pk' },
    update: { passwordHash },
    create: { email: 'student2@college.edu.pk', passwordHash, role: Role.STUDENT }
  });

  const student2Profile = await prisma.studentProfile.upsert({
    where: { userId: student2User.id },
    update: {},
    create: {
      userId: student2User.id,
      rollNumber: '002',
      firstName: 'Usman',
      lastName: 'Ali',
      gender: Gender.MALE,
      enrollmentDate: new Date('2024-08-01'),
      campusId: boysCampus.id,
      sectionId: sectionA.id
    }
  });

  const student3User = await prisma.user.upsert({
    where: { email: 'student3@college.edu.pk' },
    update: { passwordHash },
    create: { email: 'student3@college.edu.pk', passwordHash, role: Role.STUDENT }
  });

  const student3Profile = await prisma.studentProfile.upsert({
    where: { userId: student3User.id },
    update: {},
    create: {
      userId: student3User.id,
      rollNumber: '003',
      firstName: 'Hassan',
      lastName: 'Malik',
      gender: Gender.MALE,
      enrollmentDate: new Date('2024-08-01'),
      campusId: boysCampus.id,
      sectionId: sectionA.id
    }
  });

  // Link new students to existing parent
  for (const sp of [student2Profile, student3Profile]) {
    const existingLink = await prisma.studentParentLink.findUnique({
      where: { studentId_parentId: { studentId: sp.id, parentId: parentProfile.id } }
    });
    if (!existingLink) {
      await prisma.studentParentLink.create({
        data: { studentId: sp.id, parentId: parentProfile.id, relationship: Relationship.FATHER, isPrimary: true }
      });
    }
  }

  // ── E. SectionSubjectTeacher for 2026-2027 ───────────────────────

  const subjects = [physics, chemistry, math];
  for (const sub of subjects) {
    await prisma.sectionSubjectTeacher.upsert({
      where: { sectionId_subjectId_academicYear: { sectionId: sectionA.id, subjectId: sub.id, academicYear: ACADEMIC_YEAR } },
      update: {},
      create: { sectionId: sectionA.id, subjectId: sub.id, staffId: teacherProfile.id, academicYear: ACADEMIC_YEAR }
    });
  }

  // ── F. TimetablePeriodsConfig ────────────────────────────────────

  await prisma.timetablePeriodsConfig.upsert({
    where: { campusId_gradeId: { campusId: boysCampus.id, gradeId: part1.id } },
    update: {},
    create: { campusId: boysCampus.id, gradeId: part1.id, totalPeriods: 8, periodDurationMins: 45, breakAfterPeriod: 4 }
  });

  // ── G. TimetableSlots (MON-FRI, 8 slots, Section A) ─────────────

  const slotTimes = [
    { start: '08:00', end: '08:45' },
    { start: '08:45', end: '09:30' },
    { start: '09:30', end: '10:15' },
    { start: '10:15', end: '11:00' },
    { start: '11:00', end: '11:15' }, // BREAK
    { start: '11:15', end: '12:00' },
    { start: '12:00', end: '12:45' },
    { start: '12:45', end: '13:30' },
  ];

  const days: DayOfWeek[] = [DayOfWeek.MON, DayOfWeek.TUE, DayOfWeek.WED, DayOfWeek.THU, DayOfWeek.FRI];
  const subjectCycle = [physics, chemistry, math, physics, chemistry, math, math];

  for (const day of days) {
    let subjectIdx = 0;
    for (let slotNum = 1; slotNum <= 8; slotNum++) {
      const time = slotTimes[slotNum - 1];
      const isBreak = slotNum === 5;
      await prisma.timetableSlot.upsert({
        where: {
          sectionId_dayOfWeek_slotNumber_academicYear: {
            sectionId: sectionA.id, dayOfWeek: day, slotNumber: slotNum, academicYear: ACADEMIC_YEAR
          }
        },
        update: {},
        create: {
          sectionId: sectionA.id,
          dayOfWeek: day,
          slotNumber: slotNum,
          slotType: isBreak ? SlotType.BREAK : SlotType.THEORY,
          startTime: time.start,
          endTime: time.end,
          academicYear: ACADEMIC_YEAR,
          subjectId: isBreak ? null : subjectCycle[subjectIdx].id,
          staffId: isBreak ? null : teacherProfile.id
        }
      });
      if (!isBreak) subjectIdx++;
    }
  }

  // ── H. StudentAttendance (~90 records) ──────────────────────────

  const allStudentProfiles = [studentProfile, student2Profile, student3Profile];
  const statusMatrix: AttendanceStatus[][] = [
    [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.LATE, AttendanceStatus.LEAVE],
    [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT],
    [AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT, AttendanceStatus.PRESENT],
  ];

  for (let si = 0; si < allStudentProfiles.length; si++) {
    const sp = allStudentProfiles[si];
    for (const sub of subjects) {
      for (let di = 0; di < attendanceDates.length; di++) {
        await prisma.studentAttendance.upsert({
          where: { studentId_subjectId_date: { studentId: sp.id, subjectId: sub.id, date: attendanceDates[di] } },
          update: {},
          create: {
            studentId: sp.id,
            subjectId: sub.id,
            sectionId: sectionA.id,
            date: attendanceDates[di],
            status: statusMatrix[si][di],
            markedById: teacher.id
          }
        });
      }
    }
  }

  // ── I. MonthlyAttendanceSummary (March 2026) ─────────────────────

  const monthlySummaries = [
    { profile: studentProfile, presentDays: 22, absentDays: 4, lateDays: 3, leaveDays: 1, percentage: 73.3 },
    { profile: student2Profile, presentDays: 25, absentDays: 3, lateDays: 1, leaveDays: 1, percentage: 83.3 },
    { profile: student3Profile, presentDays: 20, absentDays: 5, lateDays: 3, leaveDays: 2, percentage: 66.7 },
  ];

  for (const s of monthlySummaries) {
    await prisma.monthlyAttendanceSummary.upsert({
      where: { studentId_month_year: { studentId: s.profile.id, month: 3, year: 2026 } },
      update: {},
      create: {
        studentId: s.profile.id,
        sectionId: sectionA.id,
        month: 3,
        year: 2026,
        totalDays: 30,
        presentDays: s.presentDays,
        absentDays: s.absentDays,
        lateDays: s.lateDays,
        leaveDays: s.leaveDays,
        percentage: s.percentage
      }
    });
  }

  // ── J. StaffAttendance (~20 records) ─────────────────────────────

  const staffAttendanceEntries: { profile: typeof teacherProfile; statuses: StaffAttendanceStatus[] }[] = [
    {
      profile: teacherProfile,
      statuses: [
        StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.PRESENT,
        StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.ON_LEAVE, StaffAttendanceStatus.PRESENT,
        StaffAttendanceStatus.HALF_DAY, StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.PRESENT,
        StaffAttendanceStatus.PRESENT
      ]
    },
    {
      profile: adminProfile,
      statuses: [
        StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.PRESENT,
        StaffAttendanceStatus.ABSENT, StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.PRESENT,
        StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.PRESENT, StaffAttendanceStatus.PRESENT,
        StaffAttendanceStatus.PRESENT
      ]
    }
  ];

  for (const entry of staffAttendanceEntries) {
    for (let di = 0; di < attendanceDates.length; di++) {
      const status = entry.statuses[di];
      const isWorking = status === StaffAttendanceStatus.PRESENT || status === StaffAttendanceStatus.HALF_DAY;
      const dateStr = attendanceDates[di].toISOString().split('T')[0];
      await prisma.staffAttendance.upsert({
        where: { staffId_date: { staffId: entry.profile.id, date: attendanceDates[di] } },
        update: {},
        create: {
          staffId: entry.profile.id,
          campusId: boysCampus.id,
          date: attendanceDates[di],
          status,
          checkIn: isWorking ? new Date(`${dateStr}T07:45:00`) : null,
          checkOut: isWorking ? new Date(`${dateStr}T14:00:00`) : null,
          markedById: superAdmin.id
        }
      });
    }
  }

  // ── K. FeeStructure 2026-2027 + FeeRecords ────────────────────────

  const feeStructure2627 = await prisma.feeStructure.upsert({
    where: { programId_gradeId_academicYear: { programId: fscPreMed.id, gradeId: part1.id, academicYear: ACADEMIC_YEAR } },
    update: {},
    create: {
      campusId: boysCampus.id,
      programId: fscPreMed.id,
      gradeId: part1.id,
      academicYear: ACADEMIC_YEAR,
      admissionFee: 2500,
      tuitionFee: 12000,
      examFee: 2500,
      miscFee: 1000,
      totalFee: 18000
    }
  });

  const feeRecordsData = [
    { studentId: studentProfile.id, amountDue: 18000, amountPaid: 18000, status: FeeStatus.PAID, dueDate: new Date('2026-09-01'), paidAt: new Date('2026-09-05'), receiptNumber: 'REC-2627-001' },
    { studentId: student2Profile.id, amountDue: 18000, amountPaid: 0, status: FeeStatus.PENDING, dueDate: new Date('2026-09-01'), paidAt: null, receiptNumber: null },
    { studentId: student3Profile.id, amountDue: 18000, amountPaid: 0, status: FeeStatus.OVERDUE, dueDate: new Date('2026-08-01'), paidAt: null, receiptNumber: null },
  ];

  for (const fr of feeRecordsData) {
    if (fr.receiptNumber) {
      const existing = await prisma.feeRecord.findUnique({ where: { receiptNumber: fr.receiptNumber } });
      if (!existing) {
        await prisma.feeRecord.create({ data: { ...fr, feeStructureId: feeStructure2627.id, academicYear: ACADEMIC_YEAR } });
      }
    } else {
      const existing = await prisma.feeRecord.findFirst({
        where: { studentId: fr.studentId, feeStructureId: feeStructure2627.id, academicYear: ACADEMIC_YEAR }
      });
      if (!existing) {
        await prisma.feeRecord.create({ data: { ...fr, feeStructureId: feeStructure2627.id, academicYear: ACADEMIC_YEAR } });
      }
    }
  }

  // ── L. ExamTypes, Exams, ExamResults ─────────────────────────────

  const midTermType = await prisma.examType.upsert({
    where: { name_campusId: { name: 'Mid-Term', campusId: boysCampus.id } },
    update: {},
    create: { name: 'Mid-Term', campusId: boysCampus.id }
  });

  await prisma.examType.upsert({
    where: { name_campusId: { name: 'Final', campusId: boysCampus.id } },
    update: {},
    create: { name: 'Final', campusId: boysCampus.id }
  });

  const examDefs = [
    { subject: physics, date: new Date('2026-03-15') },
    { subject: chemistry, date: new Date('2026-03-16') },
    { subject: math, date: new Date('2026-03-17') }
  ];

  const createdExams: { id: string; subjectId: string }[] = [];

  for (const def of examDefs) {
    let exam = await prisma.exam.findFirst({
      where: { examTypeId: midTermType.id, sectionId: sectionA.id, subjectId: def.subject.id, date: def.date }
    });
    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          examTypeId: midTermType.id,
          sectionId: sectionA.id,
          subjectId: def.subject.id,
          date: def.date,
          startTime: '09:00',
          durationMins: 180,
          totalMarks: 100,
          status: ExamStatus.COMPLETED,
          supervisorId: superAdmin.id,
          supervisorStaffId: principalProfile.id
        }
      });
    }
    createdExams.push({ id: exam.id, subjectId: def.subject.id });
  }

  const examResultsData = [
    { examIdx: 0, studentId: studentProfile.id, obtainedMarks: 78, isAbsent: false },
    { examIdx: 1, studentId: studentProfile.id, obtainedMarks: 82, isAbsent: false },
    { examIdx: 2, studentId: studentProfile.id, obtainedMarks: 90, isAbsent: false },
    { examIdx: 0, studentId: student2Profile.id, obtainedMarks: 65, isAbsent: false },
    { examIdx: 1, studentId: student2Profile.id, obtainedMarks: 70, isAbsent: false },
    { examIdx: 2, studentId: student2Profile.id, obtainedMarks: 55, isAbsent: false },
    { examIdx: 0, studentId: student3Profile.id, obtainedMarks: null, isAbsent: true },
    { examIdx: 1, studentId: student3Profile.id, obtainedMarks: 45, isAbsent: false },
    { examIdx: 2, studentId: student3Profile.id, obtainedMarks: 60, isAbsent: false },
  ];

  for (const r of examResultsData) {
    await prisma.examResult.upsert({
      where: { examId_studentId: { examId: createdExams[r.examIdx].id, studentId: r.studentId } },
      update: {},
      create: {
        examId: createdExams[r.examIdx].id,
        studentId: r.studentId,
        obtainedMarks: r.obtainedMarks,
        isAbsent: r.isAbsent,
        gradedById: teacher.id
      }
    });
  }

  // ── M. Announcements (3) ─────────────────────────────────────────

  const announcementsData = [
    {
      title: 'Mid-Term Exams Schedule',
      content: 'Mid-term examinations will be held from March 15-17, 2026. Physics on 15th, Chemistry on 16th, Mathematics on 17th. All students must be present 30 minutes before the exam.',
      audience: AnnouncementAudience.ALL,
      campusId: boysCampus.id,
      sectionId: null as string | null,
      authorId: superAdmin.id,
      publishedAt: new Date('2026-03-01')
    },
    {
      title: 'Fee Submission Deadline',
      content: 'Fee submission deadline for academic year 2026-2027 is September 1, 2026. Late fee will be charged after the deadline. Please submit fees on time.',
      audience: AnnouncementAudience.PARENTS,
      campusId: boysCampus.id,
      sectionId: null as string | null,
      authorId: admin.id,
      publishedAt: new Date('2026-02-15')
    },
    {
      title: 'Sports Day Event',
      content: 'Annual Sports Day will be held on April 5, 2026. All students of Section A are required to participate in at least one event. Registration forms are available from the admin office.',
      audience: AnnouncementAudience.STUDENTS,
      campusId: boysCampus.id,
      sectionId: sectionA.id,
      authorId: superAdmin.id,
      publishedAt: new Date('2026-03-20')
    }
  ];

  for (const ann of announcementsData) {
    const existingAnn = await prisma.announcement.findFirst({ where: { title: ann.title, campusId: ann.campusId } });
    if (!existingAnn) {
      await prisma.announcement.create({ data: ann });
    }
  }

  console.log('\n--- TEST CREDENTIALS (password: Test@1234) ---');
  console.log('SUPER_ADMIN          : principal@college.edu.pk     (all campuses)');
  console.log('ADMIN (Boys Campus)  : admin@college.edu.pk');
  console.log('ADMIN (Girls Campus) : admin.girls@college.edu.pk');
  console.log('TEACHER              : teacher@college.edu.pk');
  console.log('PARENT               : parent@college.edu.pk');
  console.log('STUDENT 1            : student@college.edu.pk');
  console.log('STUDENT 2            : student2@college.edu.pk');
  console.log('STUDENT 3            : student3@college.edu.pk');
  console.log('Campuses seeded: Boys Campus, Girls Campus, Primary School');
  console.log('------------------------------------------------------\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
