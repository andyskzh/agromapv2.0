import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
    } else {
      fetchMarket();
    }
  }, [session, status]);

  const fetchMarket = async () => {
    try {
      const res = await fetch("/api/market/my");
      const data = await res.json();
      if (res.ok) setMarket(data.market);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        Panel del Gestor
      </h1>

      {/* Info de mercado */}
      {market ? (
        <div className="mb-6 border p-4 rounded shadow bg-white">
          <h2 className="text-xl font-semibold mb-2 text-green-700">
            Mercado: {market.name}
          </h2>
          <p className="text-gray-700 mb-1">Ubicación: {market.location}</p>
          {market.description && (
            <p className="text-gray-600 mb-1">{market.description}</p>
          )}
          <button
            onClick={() => router.push("/dashboard/manager/edit")}
            className="mt-2 text-sm text-blue-600 hover:underline"
          >
            Editar información del mercado
          </button>
        </div>
      ) : (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded">
          <p className="mb-2 text-gray-700">
            Aún no tienes un mercado registrado.
          </p>
          <button
            onClick={() => router.push("/dashboard/manager/create")}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Crear mercado
          </button>
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => router.push("/dashboard/manager/products")}
          className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md bg-white transition"
        >
          <h3 className="text-lg font-semibold text-green-700 mb-1">
            Ver productos
          </h3>
          <p className="text-sm text-gray-600">
            Consulta todos los productos publicados de tu mercado.
          </p>
        </div>

        <div
          onClick={() => router.push("/dashboard/manager/products/create")}
          className="cursor-pointer border p-4 rounded-lg shadow hover:shadow-md bg-white transition"
        >
          <h3 className="text-lg font-semibold text-green-700 mb-1">
            Agregar producto
          </h3>
          <p className="text-sm text-gray-600">
            Publica un nuevo producto en tu mercado.
          </p>
        </div>
      </div>
    </div>
  );
}
