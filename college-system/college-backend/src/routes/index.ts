import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import { campusRouter } from "../modules/campus/campus.routes";
import { programsRouter } from "../modules/programs/programs.routes";
import { gradesRouter } from "../modules/grades/grades.routes";
import { sectionsRouter } from "../modules/sections/sections.routes";
import { subjectsRouter } from "../modules/subjects/subjects.routes";
import { staffRouter } from "../modules/staff/staff.routes";
import { studentsRouter } from "../modules/students/students.routes";
import { parentsRouter } from "../modules/parents/parents.routes";
import { sectionAssignmentRouter } from "../modules/section-assignment/section-assignment.routes";
import { staffAttendanceRouter } from '../modules/staff-attendance/staff-attendance.routes'
import { studentAttendanceRouter } from '../modules/student-attendance/student-attendance.routes'
import { timetableRouter } from '../modules/timetable/timetable.routes'
import { feesRouter } from '../modules/fees/fees.routes'
import { examsRouter } from '../modules/exams/exams.routes'
import { resultsRouter } from '../modules/results/results.routes'
import { announcementsRouter } from '../modules/announcements/announcements.routes'
import { reportsRouter } from '../modules/reports/reports.routes'
import { principalDashboardRouter } from '../modules/dashboard/principal/principalDashboard.routes'
import { adminDashboardRouter } from '../modules/dashboard/admin/adminDashboard.routes'
import { teacherDashboardRouter } from '../modules/dashboard/teacher/teacherDashboard.routes'
import { parentDashboardRouter } from '../modules/dashboard/parent/parentDashboard.routes'
import { studentDashboardRouter } from '../modules/dashboard/student/studentDashboard.routes'
import { systemRouter } from '../modules/system/system.routes'

const router = Router();

// ─── Auth ──────────────────────────────────────────────────────────────────
router.use("/auth", authRouter);

// ─── Core modules ──────────────────────────────────────────────────────────
router.use("/campus", campusRouter);
router.use("/programs", programsRouter);
router.use("/grades", gradesRouter);
router.use("/sections", sectionsRouter);
router.use("/subjects", subjectsRouter);
router.use("/staff", staffRouter);
router.use("/students", studentsRouter);
router.use("/parents", parentsRouter);
router.use("/section-assignment", sectionAssignmentRouter);

// ─── Attendance & Timetable ────────────────────────────────────────────────
router.use('/staff-attendance', staffAttendanceRouter)
router.use('/student-attendance', studentAttendanceRouter)
router.use('/timetable', timetableRouter)

// ─── Academic ─────────────────────────────────────────────────────────────
router.use('/fees', feesRouter)
router.use('/exams', examsRouter)
router.use('/results', resultsRouter)
router.use('/announcements', announcementsRouter)
router.use('/reports', reportsRouter)

// ─── System (backup management) ───────────────────────────────────────────
router.use('/system', systemRouter)

// ─── Dashboards ───────────────────────────────────────────────────────────
router.use('/dashboard/principal', principalDashboardRouter)
router.use('/dashboard/admin', adminDashboardRouter)
router.use('/dashboard/teacher', teacherDashboardRouter)
router.use('/dashboard/parent', parentDashboardRouter)
router.use('/dashboard/student', studentDashboardRouter)

export default router;
