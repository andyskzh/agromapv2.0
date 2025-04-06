import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [market, setMarket] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      session.user.role !== "MARKET_MANAGER"
    ) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const response = await fetch("/api/market/my");
        const data = await response.json();
        if (data.market) {
          setMarket(data.market);
        }
      } catch (error) {
        console.error("Error al cargar el mercado:", error);
        setError("Error al cargar los datos del mercado");
      }
    };

    if (session?.user?.role === "MARKET_MANAGER") {
      fetchMarket();
    }
  }, [session]);

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas eliminar este mercado? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/market/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar el mercado");
      }

      router.push("/dashboard/manager/create");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Bienvenido a tu Dashboard
            </h1>
            <p className="text-gray-600 mb-6">
              Aún no tienes un mercado registrado. ¡Crea uno para empezar!
            </p>
            <button
              onClick={() => router.push("/dashboard/manager/create")}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Crear Mercado
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {market.image && (
            <div className="relative h-48 w-full">
              <Image
                src={market.image}
                alt={market.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {market.name}
                </h1>
                <p className="mt-1 text-sm text-gray-500">{market.location}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push("/dashboard/manager/edit")}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>

            {market.description && (
              <p className="mt-4 text-gray-600">{market.description}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push("/dashboard/manager/products")}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Ver Productos
              </button>
              <button
                onClick={() =>
                  router.push("/dashboard/manager/products/create")
                }
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Agregar Producto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
