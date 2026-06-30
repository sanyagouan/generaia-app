import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Settings, Building2, CreditCard, Smartphone, Shield } from 'lucide-react';

export default async function ConfiguracionPage() {
  const { orgId, userId } = await auth();

  let tenant = null;
  if (orgId) {
    const [result] = await db
      .select()
      .from(tenants)
      .where(eq(tenants.clerkOrgId, orgId))
      .limit(1);
    tenant = result;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100">Configuración</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Gestiona los ajustes de tu asistente
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Información del Restaurante */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600/10">
              <Building2 className="size-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Restaurante</h2>
          </div>
          {tenant ? (
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-zinc-500">Nombre</p>
                <p className="text-sm text-zinc-200">{tenant.name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Slug</p>
                <p className="text-sm text-zinc-200">{tenant.slug}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Plan</p>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tenant.plan === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                  tenant.plan === 'trial' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {tenant.plan === 'active' ? 'Activo' :
                   tenant.plan === 'trial' ? 'Prueba' : tenant.plan}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-zinc-500">
                No tienes un restaurante asociado. Crea una organización desde el sidebar.
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Org ID: {orgId ?? 'N/A'}
              </p>
            </div>
          )}
        </div>

        {/* Próximamente */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800">
              <Smartphone className="size-5 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">WhatsApp</h2>
          </div>
          <div className="mt-4">
            <p className="text-sm text-zinc-500">
              Conexión con WhatsApp — próximamente.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              Podrás conectar tu número de WhatsApp para que el asistente atienda clientes automáticamente.
            </p>
          </div>
        </div>

        {/* Facturación */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800">
              <CreditCard className="size-5 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Facturación</h2>
          </div>
          <div className="mt-4">
            <p className="text-sm text-zinc-500">
              Stripe no configurado aún.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              Próximamente: planes de pago, gestión de suscripciones y facturas.
            </p>
          </div>
        </div>

        {/* Seguridad */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-800">
              <Shield className="size-5 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-100">Seguridad</h2>
          </div>
          <div className="mt-4">
            <p className="text-sm text-zinc-500">
              Autenticación gestionada por Clerk.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              User ID: {userId?.slice(0, 12)}…
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
