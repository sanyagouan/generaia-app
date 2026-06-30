import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { tenants, conversations, messages } from '@/db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';
import Link from 'next/link';
import { MessageSquare, Phone, Clock, CheckCircle2 } from 'lucide-react';

export default async function ConversacionesPage() {
  const { orgId } = await auth();

  // Obtener todas las conversaciones con tenant y último mensaje
  const allConversations = await db
    .select({
      id: conversations.id,
      customerName: conversations.customerName,
      customerPhone: conversations.customerPhone,
      status: conversations.status,
      createdAt: conversations.createdAt,
      tenantName: tenants.name,
      tenantSlug: tenants.slug,
      lastMessage: sql<string>`(
        SELECT content FROM messages
        WHERE conversation_id = ${conversations.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      lastMessageAt: sql<string>`(
        SELECT created_at FROM messages
        WHERE conversation_id = ${conversations.id}
        ORDER BY created_at DESC LIMIT 1
      )`,
      messageCount: sql<number>`(
        SELECT count(*) FROM messages
        WHERE conversation_id = ${conversations.id}
      )`,
    })
    .from(conversations)
    .leftJoin(tenants, eq(conversations.tenantId, tenants.id))
    .orderBy(desc(conversations.updatedAt));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Conversaciones</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {allConversations.length} conversaciones en total
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Restaurante
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Último mensaje
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                Mensajes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {allConversations.map((conv) => (
              <tr
                key={conv.id}
                className="transition-colors hover:bg-zinc-800/50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-zinc-800">
                      <Phone className="size-4 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-100">
                        {conv.customerName ?? 'Desconocido'}
                      </p>
                      <p className="text-xs text-zinc-500">{conv.customerPhone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-zinc-300">{conv.tenantName}</span>
                </td>
                <td className="max-w-xs truncate px-6 py-4">
                  <p className="truncate text-sm text-zinc-400">
                    {conv.lastMessage ?? '—'}
                  </p>
                  {conv.lastMessageAt && (
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {new Date(conv.lastMessageAt).toLocaleString('es-ES')}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      conv.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {conv.status === 'active' ? (
                      <MessageSquare className="size-3" />
                    ) : (
                      <CheckCircle2 className="size-3" />
                    )}
                    {conv.status === 'active' ? 'Activa' : 'Cerrada'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm text-zinc-400">{conv.messageCount}</span>
                </td>
              </tr>
            ))}
            {allConversations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500">
                  No hay conversaciones todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
