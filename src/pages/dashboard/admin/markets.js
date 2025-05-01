import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BackToDashboard from "@/components/BackToDashboard";

export default function AdminMarketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    managerId: "",
    latitude: "",
    longitude: "",
  });
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchMarkets();
    fetchManagers();
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await fetch("/api/admin/markets");
      const data = await res.json();
      if (res.ok) {
        setMarkets(data.markets || []);
      } else {
        setError(data.message || "Error al cargar los mercados");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar los mercados");
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

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este mercado?")) return;

    try {
      const res = await fetch(`/api/admin/markets/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMarkets((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await res.json();
        setError(data.message || "Error al eliminar el mercado");
      }
    } catch (err) {
      console.error(err);
      setError("Error al eliminar el mercado");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/admin/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setShowForm(false);
        setFormData({
          name: "",
          location: "",
          description: "",
          managerId: "",
          latitude: "",
          longitude: "",
        });
        fetchMarkets();
      } else {
        setError(data.message || "Error al crear el mercado");
      }
    } catch (err) {
      console.error(err);
      setError("Error al crear el mercado");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <BackToDashboard />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">
          Gestión de Mercados
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nuevo Mercado"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-white rounded-lg shadow-md space-y-4"
        >
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Nombre del mercado *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
            />
          </div>

          {/* Coordenadas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Latitud *
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                placeholder="Ej: 19.4517"
              />
            </div>
            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Longitud *
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                placeholder="Ej: -70.6970"
              />
            </div>
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
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
            >
              <option value="">Sin gestor asignado</option>
              {managers.map((manager) => (
                <option key={manager.id} value={manager.id}>
                  {manager.name || manager.username}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Crear Mercado
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <div
            key={market.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-green-800">
                {market.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    router.push(`/dashboard/admin/markets/edit/${market.id}`)
                  }
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(market.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Ubicación:</span>{" "}
                {market.location}
              </p>
              {market.description && (
                <p className="text-gray-600">
                  <span className="font-medium">Descripción:</span>{" "}
                  {market.description}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Gestor:</span>{" "}
                {market.manager
                  ? market.manager.name || market.manager.username
                  : "Sin asignar"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Productos:</span>{" "}
                {market.products?.length || 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {markets.length === 0 && !loading && (
        <p className="text-center text-gray-600 mt-8">
          No hay mercados registrados.
        </p>
      )}
    </div>
  );
}
