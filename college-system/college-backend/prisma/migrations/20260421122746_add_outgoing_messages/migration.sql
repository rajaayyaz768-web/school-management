-- CreateTable
CREATE TABLE "outgoing_messages" (
    "id" TEXT NOT NULL,
    "to_phone" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WHATSAPP',
    "template_name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "provider_message_id" TEXT,
    "error_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outgoing_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outgoing_messages_to_phone_idx" ON "outgoing_messages"("to_phone");

-- CreateIndex
CREATE INDEX "outgoing_messages_status_idx" ON "outgoing_messages"("status");
