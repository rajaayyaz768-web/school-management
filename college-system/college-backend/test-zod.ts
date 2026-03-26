import { z } from "zod";
const programBodySchema = z.object({
  campus_id: z.string().uuid("Invalid campus ID"),
  name: z.string().min(3).max(100),
  code: z.string().max(15).regex(/^[A-Z0-9\-\s]+$/, "Uppercase letters, numbers, spaces, and dashes only"),
  durationYears: z.number().min(1).max(5).optional(),
});
const updateProgramSchema = z.object({
  body: programBodySchema.partial(),
});
try {
  updateProgramSchema.parse({
    body: {
      campus_id: "da477d18-7c57-4676-8a06-23fc84a638c0",
      name: "Computer Science",
      code: "CS",
      durationYears: 2
    },
    params: { id: "da477d18-7c57-4676-8a06-23fc84a638c0" },
    query: {}
  });
  console.log("Success with valid data!");
} catch(e: any) {
  console.log("Error:", JSON.stringify(e.errors, null, 2));
}

try {
  updateProgramSchema.parse({
    body: {
      campus_id: "da477d18-7c57-4676-8a06-23fc8", // invalid UUID
      name: "CS", // too short
      code: "cs 1", // lowercase
      durationYears: 10 // too large
    }
  });
  console.log("Success with invalid data!");
} catch(e: any) {
  console.log("Expected validation error:", JSON.stringify(e.errors, null, 2));
}

