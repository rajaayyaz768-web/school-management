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

const router = Router();

// ─── Auth ──────────────────────────────────────────────────────────────────
router.use("/auth", authRouter);

// Additional module routes will be mounted here in Steps 5–7:
// router.use("/students", studentsRouter);
// router.use("/staff", staffRouter);
router.use("/campus", campusRouter);
router.use("/programs", programsRouter);
router.use("/grades", gradesRouter);
router.use("/sections", sectionsRouter);
router.use("/subjects", subjectsRouter);
router.use("/staff", staffRouter);
router.use("/students", studentsRouter);
router.use("/parents", parentsRouter);
router.use("/section-assignment", sectionAssignmentRouter);
router.use('/staff-attendance', staffAttendanceRouter)
router.use('/student-attendance', studentAttendanceRouter)
router.use('/timetable', timetableRouter)
router.use('/fees', feesRouter)
// ... etc.

export default router;
