-- Remove duplicate grades, keeping the one with the lowest createdAt per (program_id, name)
DELETE FROM "grades"
WHERE id NOT IN (
  SELECT DISTINCT ON (program_id, name) id
  FROM "grades"
  ORDER BY program_id, name, created_at ASC
);

-- CreateIndex
CREATE UNIQUE INDEX "grades_program_id_name_key" ON "grades"("program_id", "name");
