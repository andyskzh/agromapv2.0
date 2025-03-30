import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AdminMarketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetch("/api/admin/markets")
      .then((res) => res.json())
      .then((data) => setMarkets(data.markets || []));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este mercado?")) return;
    const res = await fetch(`/api/admin/markets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMarkets((prev) => prev.filter((m) => m.id !== id));
    } else {
      alert("Error al eliminar mercado");
    }
  };

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-900 mb-4">🏪 Gestión de Mercados</h1>

      <table className="w-full bg-white border shadow-sm rounded">
        <thead className="bg-green-100 text-green-900 text-left">
          <tr>
            <th className="p-3">Nombre</th>
            <th className="p-3">Ubicación</th>
            <th className="p-3">Descripción</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m) => (
            <tr key={m.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{m.name}</td>
              <td className="p-3">{m.location}</td>
              <td className="p-3">{m.description}</td>
              <td className="p-3">
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
