import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      {/* Menú lateral */}
      <aside className="w-64 bg-green-800 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Panel Admin</h2>
        <nav className="space-y-2">
          <Link href="/dashboard/admin" className="block hover:text-green-300">🏠 Inicio</Link>
          <Link href="/dashboard/admin/users" className="block hover:text-green-300">👤 Usuarios</Link>
          <Link href="/dashboard/admin/markets" className="block hover:text-green-300">🏪 Mercados</Link>
          <Link href="/dashboard/admin/products" className="block hover:text-green-300">🛒 Productos</Link>
          <Link href="/dashboard/admin/bases" className="block hover:text-green-300">📦 Productos base</Link>
          <Link href="/dashboard/admin/comments" className="block hover:text-green-300">💬 Comentarios</Link>
          <Link href="/dashboard/admin/stats" className="block hover:text-green-300">📊 Estadísticas</Link>
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-10 bg-gray-50">
        <h1 className="text-3xl font-bold text-green-900 mb-6">Bienvenido, Administrador</h1>
        <p className="text-gray-700">
          Usa el menú de la izquierda para gestionar usuarios, productos, comentarios y más.
        </p>
      </main>
    </div>
  );
}
