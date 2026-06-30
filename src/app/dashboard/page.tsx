import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tenants, conversations, messages } from '@/db/schema';
import { count, eq, gte, sql } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, MessageCircle, ArrowUpRight } from 'lucide-react';

export default async function DashboardPage() {
  const { userId, orgId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const [activeConversations] = await db
    .select({ value: count() })
    .from(conversations)
    .where(eq(conversations.status, 'active'));

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [messagesToday] = await db
    .select({ value: count() })
    .from(messages)
    .where(gte(messages.createdAt, todayStart));

  const [activeTenants] = await db
    .select({ value: count() })
    .from(tenants)
    .where(sql`${tenants.plan} IN ('active', 'trial')`);

  let tenantName: string | null = null;
  if (orgId) {
    const [tenant] = await db
      .select({ name: tenants.name })
      .from(tenants)
      .where(eq(tenants.clerkOrgId, orgId))
      .limit(1);
    tenantName = tenant?.name ?? null;
  }

  const stats = [
    { title: 'Conversaciones activas', value: activeConversations.value, icon: MessageSquare, description: 'Chats en curso' },
    { title: 'Mensajes hoy', value: messagesToday.value, icon: MessageCircle, description: 'En las últimas 24h' },
    { title: 'Tenants activos', value: activeTenants.value, icon: Users, description: 'Restaurantes activos' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        {tenantName && <p className="mt-1 text-sm text-zinc-400">{tenantName}</p>}
        <p className="text-xs text-zinc-600">User: {userId} · Org: {orgId ?? 'N/A'}</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">{stat.title}</CardTitle>
                <Icon className="size-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-zinc-100">{stat.value}</span>
                  <ArrowUpRight className="size-4 text-emerald-500" />
                </div>
                <p className="mt-1 text-xs text-zinc-500">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
