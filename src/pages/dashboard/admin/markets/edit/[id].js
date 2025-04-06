import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function EditMarketAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [market, setMarket] = useState(null);
  const [managers, setManagers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    managerId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (id) {
      fetchMarket();
      fetchManagers();
    }
  }, [id]);

  const fetchMarket = async () => {
    try {
      const res = await fetch(`/api/admin/markets/${id}`);
      const data = await res.json();
      if (res.ok) {
        setMarket(data.market);
        setFormData({
          name: data.market.name,
          location: data.market.location,
          description: data.market.description || "",
          managerId: data.market.managerId,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar el mercado");
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        const marketManagers = data.users.filter(
          (user) => user.role === "MARKET_MANAGER"
        );
        setManagers(marketManagers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`/api/admin/markets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al actualizar el mercado");
        return;
      }

      router.push("/dashboard/admin/markets");
    } catch (err) {
      console.error(err);
      setError("Error al procesar la solicitud");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!market) return <p className="p-6">Mercado no encontrado</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        Editar Mercado: {market.name}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Nombre del mercado *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Ubicación *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Descripción
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Gestor del mercado
          </label>
          <select
            value={formData.managerId}
            onChange={(e) =>
              setFormData({ ...formData, managerId: e.target.value })
            }
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Sin gestor asignado</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.name || manager.username}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/markets")}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
