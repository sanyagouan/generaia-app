import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

// ─── TENANT ───────────────────────────────────────────────
// Cada tenant = un restaurante. Vinculado a Clerk Organization.
export const tenants = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),           // subdomain: la-trattoria.app.generaia.com
  name: text("name").notNull(),                     // "La Trattoria"
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  plan: text("plan").notNull().default("trial"),    // trial | active | cancelled
  settings: jsonb("settings").default({}),           // asistente config, horario, tono, FAQs
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  evolutionInstanceId: text("evolution_instance_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── CONVERSATIONS ────────────────────────────────────────
// Un chat entre un cliente del restaurante y el asistente IA
export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerName: text("customer_name"),
  status: text("status").notNull().default("active"),  // active | closed | archived
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── MESSAGES ─────────────────────────────────────────────
// Mensajes individuales dentro de una conversación
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").references(() => conversations.id).notNull(),
  role: text("role").notNull(),                  // user | assistant | system
  content: text("content").notNull(),
  metadata: jsonb("metadata").default({}),        // media_url, tipo, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
