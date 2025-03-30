import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function AdminMarketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [markets, setMarkets] = useState([]);
  const [newMarket, setNewMarket] = useState({ name: "", location: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    const res = await fetch("/api/admin/markets");
    const data = await res.json();
    setMarkets(data.markets || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este mercado?")) return;
    const res = await fetch(`/api/admin/markets/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMarkets((prev) => prev.filter((m) => m.id !== id));
    } else {
      alert("Error al eliminar mercado");
    }
  };

  const handleAddMarket = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/markets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMarket),
    });
    if (res.ok) {
      setShowForm(false);
      setNewMarket({ name: "", location: "", description: "" });
      fetchMarkets();
    }
  };

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-900 mb-6">🏪 Gestión de Mercados</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition-colors duration-200"
      >
        {showForm ? "❌ Cancelar" : "➕ Añadir Mercado"}
      </button>

      {showForm && (
        <form 
          onSubmit={handleAddMarket} 
          className="space-y-4 mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={newMarket.name}
              onChange={(e) => setNewMarket({ ...newMarket, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={newMarket.location}
              onChange={(e) => setNewMarket({ ...newMarket, location: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              required
              rows="3"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={newMarket.description}
              onChange={(e) => setNewMarket({ ...newMarket, description: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-700 text-white px-4 py-3 rounded-lg hover:bg-green-800 transition-colors duration-200"
          >
            Crear Mercado
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-100">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {markets.map((market) => (
                <tr key={market.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{market.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{market.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{market.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDelete(market.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
