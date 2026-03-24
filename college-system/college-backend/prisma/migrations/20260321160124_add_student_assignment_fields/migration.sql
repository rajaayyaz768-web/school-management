-- AlterEnum
ALTER TYPE "StudentStatus" ADD VALUE 'UNASSIGNED';

-- DropForeignKey
ALTER TABLE "student_profiles" DROP CONSTRAINT "student_profiles_section_id_fkey";

-- AlterTable
ALTER TABLE "student_profiles" ADD COLUMN     "ranking_marks" DOUBLE PRECISION,
ALTER COLUMN "roll_number" DROP NOT NULL,
ALTER COLUMN "section_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
