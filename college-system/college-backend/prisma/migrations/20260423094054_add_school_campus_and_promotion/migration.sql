-- CreateEnum
CREATE TYPE "CampusType" AS ENUM ('SCHOOL', 'COLLEGE');

-- CreateEnum
CREATE TYPE "TeachingMode" AS ENUM ('SUBJECT_WISE', 'CLASS_TEACHER', 'DUAL_TEACHER');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('TRANSITIONAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "PromotionRunStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PromotionRecordStatus" AS ENUM ('PROMOTED', 'DETAINED', 'GRADUATED', 'WITHDRAWN');

-- AlterTable
ALTER TABLE "campuses" ADD COLUMN     "campus_type" "CampusType" NOT NULL DEFAULT 'COLLEGE';

-- AlterTable
ALTER TABLE "grades" ADD COLUMN     "is_transitional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teaching_mode" "TeachingMode";

-- CreateTable
CREATE TABLE "academic_years" (
    "id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "academic_years_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_runs" (
    "id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "academic_year_id" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL,
    "status" "PromotionRunStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "initiated_by_id" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_promotion_records" (
    "id" TEXT NOT NULL,
    "promotion_run_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "from_section_id" TEXT,
    "to_section_id" TEXT,
    "status" "PromotionRecordStatus" NOT NULL,
    "new_roll_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_promotion_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "academic_years_campus_id_name_key" ON "academic_years"("campus_id", "name");

-- AddForeignKey
ALTER TABLE "academic_years" ADD CONSTRAINT "academic_years_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_runs" ADD CONSTRAINT "promotion_runs_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_runs" ADD CONSTRAINT "promotion_runs_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_runs" ADD CONSTRAINT "promotion_runs_initiated_by_id_fkey" FOREIGN KEY ("initiated_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_promotion_records" ADD CONSTRAINT "student_promotion_records_promotion_run_id_fkey" FOREIGN KEY ("promotion_run_id") REFERENCES "promotion_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_promotion_records" ADD CONSTRAINT "student_promotion_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_promotion_records" ADD CONSTRAINT "student_promotion_records_from_section_id_fkey" FOREIGN KEY ("from_section_id") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_promotion_records" ADD CONSTRAINT "student_promotion_records_to_section_id_fkey" FOREIGN KEY ("to_section_id") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
