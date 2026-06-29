-- GeneraIA initial schema
-- Multi-tenant: tenants, conversations, messages

CREATE TABLE IF NOT EXISTS "tenants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "name" text NOT NULL,
  "clerk_org_id" text NOT NULL UNIQUE,
  "plan" text DEFAULT 'trial' NOT NULL,
  "settings" jsonb DEFAULT '{}'::jsonb,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "evolution_instance_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id"),
  "customer_phone" text NOT NULL,
  "customer_name" text,
  "status" text DEFAULT 'active' NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" uuid NOT NULL REFERENCES "conversations"("id"),
  "role" text NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_conversations_tenant_id ON "conversations"("tenant_id");
CREATE INDEX idx_conversations_phone ON "conversations"("customer_phone");
CREATE INDEX idx_messages_conversation_id ON "messages"("conversation_id");
CREATE INDEX idx_messages_created_at ON "messages"("created_at");

-- Enable Row-Level Security
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
