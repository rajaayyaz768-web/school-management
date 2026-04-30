/**
 * One-time data wipe — keeps SUPER_ADMIN user, deletes everything else.
 * Run: npx ts-node scripts/clear-data.ts
 */

import 'dotenv/config'
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Save the super admin before wiping
  const superAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN },
  })

  if (!superAdmin) {
    console.error('❌  No SUPER_ADMIN user found. Aborting.')
    process.exit(1)
  }

  // Capture all fields into plain variables BEFORE any DB operation
  const { id, email, passwordHash, role, isActive, recoveryEmail, createdAt, updatedAt } = superAdmin

  console.log(`\n🔒  Preserving super admin: ${email}`)
  console.log('🗑   Wiping all other data...\n')

  // 2. Truncate in one statement so all FKs are handled together
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      users,
      campuses,
      chat_conversations,
      outgoing_messages,
      app_versions
    CASCADE
  `)

  // 3. Reinsert super admin with exact same record (same id, same password hash)
  await prisma.$executeRawUnsafe(
    `INSERT INTO users
       (id, email, password_hash, role, is_active, recovery_email, created_at, updated_at)
     VALUES ($1, $2, $3, $4::\"Role\", $5, $6, $7, $8)`,
    id,
    email,
    passwordHash,
    role,
    isActive,
    recoveryEmail,
    createdAt,
    updatedAt,
  )

  console.log('✅  Done. Database is clean.')
  console.log(`\n   Principal login:`)
  console.log(`   Email   : ${email}`)
  console.log(`   Password: (same as before)\n`)
}

main()
  .catch((err) => {
    console.error('❌  Script failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
