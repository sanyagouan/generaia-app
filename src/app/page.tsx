import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-5xl font-bold mb-4">GeneraIA</h1>
      <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
        Asistentes IA para hostelería
      </p>
      {userId ? (
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir al dashboard
        </Link>
      ) : (
        <Link
          href="/sign-in"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Iniciar sesión
        </Link>
      )}
    </main>
  );
}
