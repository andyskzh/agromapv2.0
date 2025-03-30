import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function MarketProducts() {
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
    } else {
      fetchProducts();
    }
  }, [session, status]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products/my");
      const data = await res.json();
      if (res.ok) setProducts(data.products);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    const res = await fetch(`/api/products/${productId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } else {
      alert("Error al eliminar el producto.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-4">Mis Productos</h1>

      <button
        onClick={() => router.push("/dashboard/manager/products/create")}
        className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        + Agregar producto
      </button>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-800">No hay productos registrados.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li key={product.id} className="border p-4 rounded shadow bg-white">
              <h3 className="text-lg font-semibold text-gray-500">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                Cantidad: {product.quantity}
              </p>
              {product.description && (
                <p className="text-sm text-gray-600 mb-1">
                  {product.description}
                </p>
              )}
              <button
                onClick={() =>
                  router.push(`/dashboard/manager/products/edit/${product.id}`)
                }
                className="text-blue-600 hover:underline text-sm mr-4"
              >
                Editar
              </button>

              <button
                onClick={() => handleDelete(product.id)}
                className="text-red-600 hover:underline text-sm"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
