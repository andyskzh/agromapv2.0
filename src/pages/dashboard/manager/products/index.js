import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export default function ManagerProducts() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Redirigir si no está autenticado o no es gestor
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "MARKET_MANAGER"
    ) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user?.role === "MARKET_MANAGER"
    ) {
      fetchProducts();
    }
  }, [status, session]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/manager/products");
      if (!res.ok) {
        throw new Error("Error al cargar productos");
      }
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      return;
    }

    try {
      const res = await fetch(`/api/manager/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error al eliminar el producto");
      }

      // Actualizar la lista de productos
      setProducts(products.filter((product) => product.id !== productId));
    } catch (err) {
      console.error("Error al eliminar producto:", err);
      setError(`Error al eliminar producto: ${err.message}`);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }

  if (
    status === "unauthenticated" ||
    session?.user?.role !== "MARKET_MANAGER"
  ) {
    return null;
  }

  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-900">Mis Productos</h1>
          <Link
            href="/dashboard/manager/products/create"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Agregar Producto
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No hay productos registrados</p>
            <Link
              href="/dashboard/manager/products/create"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Agregar mi primer producto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 relative">
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold text-green-900 mb-2">
                    {product.name}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2">
                    {product.quantity} {product.unit}
                  </p>
                  {product.price && (
                    <p className="text-green-600 font-medium">
                      ${product.price} / {product.priceType}
                    </p>
                  )}
                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() =>
                        router.push(
                          `/dashboard/manager/products/edit/${product.id}`
                        )
                      }
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
