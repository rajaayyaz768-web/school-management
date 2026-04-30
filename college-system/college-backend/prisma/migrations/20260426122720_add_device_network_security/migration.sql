-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DeviceRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "registered_devices" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "device_token" TEXT NOT NULL,
    "label" TEXT,
    "user_agent" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registered_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_registration_requests" (
    "id" TEXT NOT NULL,
    "admin_user_id" TEXT NOT NULL,
    "device_token" TEXT NOT NULL,
    "user_agent" TEXT,
    "requested_from_ip" TEXT,
    "status" "DeviceRequestStatus" NOT NULL DEFAULT 'PENDING',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "reviewed_at" TIMESTAMP(3),
    "review_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_registration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campus_allowed_networks" (
    "id" TEXT NOT NULL,
    "campus_id" TEXT NOT NULL,
    "cidr" TEXT NOT NULL,
    "label" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campus_allowed_networks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "registered_devices_admin_user_id_idx" ON "registered_devices"("admin_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "registered_devices_admin_user_id_device_token_key" ON "registered_devices"("admin_user_id", "device_token");

-- CreateIndex
CREATE INDEX "device_registration_requests_admin_user_id_idx" ON "device_registration_requests"("admin_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "device_registration_requests_admin_user_id_device_token_key" ON "device_registration_requests"("admin_user_id", "device_token");

-- CreateIndex
CREATE INDEX "campus_allowed_networks_campus_id_idx" ON "campus_allowed_networks"("campus_id");

-- AddForeignKey
ALTER TABLE "registered_devices" ADD CONSTRAINT "registered_devices_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_registration_requests" ADD CONSTRAINT "device_registration_requests_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campus_allowed_networks" ADD CONSTRAINT "campus_allowed_networks_campus_id_fkey" FOREIGN KEY ("campus_id") REFERENCES "campuses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
