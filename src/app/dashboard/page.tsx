import { auth } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const { userId, orgId } = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-2">
        User: {userId}
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Organization: {orgId ?? 'Sin organización activa'}
      </p>
    </main>
  );
}
