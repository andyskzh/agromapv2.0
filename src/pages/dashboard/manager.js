import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUser } from "react-icons/fa";

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [market, setMarket] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    sasProducts: 0,
    recentActivity: [],
    topRatedProducts: [],
    mostCommentedProducts: [],
    recentComments: [],
    totalComments: 0,
    averageRating: 0,
    unavailableProducts: 0,
  });

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
          fetchStats(data.market.id);
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

  const fetchStats = async (marketId) => {
    try {
      const response = await fetch(`/api/manager/stats?marketId=${marketId}`);
      const data = await response.json();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const handleDelete = async () => {
    // Obtener información del mercado antes de eliminarlo
    const marketResponse = await fetch("/api/market/my");
    const marketData = await marketResponse.json();

    if (!marketData.market) {
      setError("No se pudo obtener la información del mercado");
      return;
    }

    const market = marketData.market;
    const hasProducts = market.products && market.products.length > 0;

    const confirmMessage = hasProducts
      ? `¿Estás seguro de que deseas eliminar este mercado?\n\nEsta acción eliminará:\n- ${market.products.length} productos\n- Todos los comentarios asociados\n- Todos los horarios configurados\n\nEsta acción no se puede deshacer.`
      : "¿Estás seguro de que deseas eliminar este mercado?";

    if (!confirm(confirmMessage)) return;

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

      if (data.deletedItems) {
        alert(
          `Mercado eliminado correctamente.\nSe eliminaron:\n- ${data.deletedItems.products} productos\n- ${data.deletedItems.comments} comentarios`
        );
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
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Encabezado del mercado */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          {market.image && (
            <div className="relative h-48 w-full">
              <img
                src={market.image}
                alt={market.name}
                className="w-full h-full object-cover"
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
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push("/dashboard/manager/profile")}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <FaUser className="mr-2" />
                  Editar Perfil
                </button>
                <button
                  onClick={() => router.push("/dashboard/manager/edit")}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Editar Mercado
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
          </div>
        </div>

        {/* Estadísticas y acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Productos Totales
            </h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.totalProducts}
            </p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span className="text-green-600">
                {stats.availableProducts} disponibles
              </span>
              <span className="mx-2">•</span>
              <span className="text-red-600">
                {stats.unavailableProducts} no disponibles
              </span>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Interacción de Usuarios
            </h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {stats.totalComments}
            </p>
            <p className="mt-2 text-sm text-gray-500">Comentarios totales</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Valoración Promedio
            </h3>
            <div className="mt-2 flex items-center">
              <p className="text-3xl font-bold text-yellow-500">
                {stats.averageRating}
              </p>
              <div className="ml-2 flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(stats.averageRating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900">
              Acciones Rápidas
            </h3>
            <div className="mt-4 space-y-2">
              <Link
                href="/dashboard/manager/products/create"
                className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Agregar Producto
              </Link>
              <Link
                href="/dashboard/manager/products"
                className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Ver Productos
              </Link>
            </div>
          </div>
        </div>

        {/* Productos mejor valorados */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Productos Mejor Valorados
          </h2>
          {stats.topRatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.topRatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {product.image && (
                    <div className="relative h-32 w-full">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.round(product.averageRating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {product.averageRating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay productos valorados aún
            </p>
          )}
        </div>

        {/* Productos más comentados */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Productos Más Comentados
          </h2>
          {stats.mostCommentedProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.mostCommentedProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg overflow-hidden"
                >
                  {product.image && (
                    <div className="relative h-32 w-full">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {product.totalComments} comentarios
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay productos comentados aún
            </p>
          )}
        </div>

        {/* Comentarios recientes */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Comentarios Recientes
          </h2>
          {stats.recentComments.length > 0 ? (
            <div className="space-y-4">
              {stats.recentComments.map((comment) => (
                <div key={comment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">
                        {comment.userName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {comment.productName}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-4 w-4 ${
                            i < comment.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-gray-600">{comment.content}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay comentarios recientes
            </p>
          )}
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Actividad Reciente
          </h2>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "create" && (
                      <svg
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    )}
                    {activity.type === "update" && (
                      <svg
                        className="h-6 w-6 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay actividad reciente
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
