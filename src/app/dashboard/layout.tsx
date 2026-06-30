import Link from 'next/link';
import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  Bot,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/conversaciones', label: 'Conversaciones', icon: MessageSquare },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: Settings },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await auth();
  const orgId = authResult.orgId ?? null;

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-zinc-800 bg-zinc-900">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-600">
            <Bot className="size-5 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-100">GeneraIA</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section — Org info / User */}
        <div className="border-t border-zinc-800 px-4 py-4">
          <div className="flex items-center justify-between">
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: 'w-full',
                  organizationSwitcherTrigger:
                    'w-full rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100',
                  organizationSwitcherTriggerIcon: 'text-zinc-500',
                },
              }}
            />
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2">
            <UserButton
              appearance={{
                elements: {
                  userButtonBox: 'shrink-0',
                },
              }}
            />
            <span className="text-sm text-zinc-400">
              {orgId ? orgId.slice(0, 8) + '…' : 'Sin organización'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1">{children}</main>
    </div>
  );
}
