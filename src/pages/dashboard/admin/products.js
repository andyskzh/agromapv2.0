import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterAvailability, setFilterAvailability] = useState("ALL");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products || []);
      } else {
        setError(data.message || "Error al cargar los productos");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSuccess("Producto eliminado correctamente");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Error al eliminar el producto");
      }
    } catch (err) {
      console.error(err);
      setError("Error al eliminar el producto");
    }
  };

  // Filtrar productos según búsqueda, categoría y disponibilidad
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.market?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "ALL" || product.category === filterCategory;
    const matchesAvailability =
      filterAvailability === "ALL" ||
      (filterAvailability === "AVAILABLE" && product.isAvailable) ||
      (filterAvailability === "UNAVAILABLE" && !product.isAvailable);

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">
          Gestión de Productos
        </h1>
        <button
          onClick={() => router.push("/dashboard/admin/products/create")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          + Nuevo Producto
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
          {success}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o mercado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
          >
            <option value="ALL">Todas las categorías</option>
            <option value="FRUTA">Frutas</option>
            <option value="HORTALIZA">Hortalizas</option>
            <option value="VIANDA">Viandas</option>
            <option value="CARNE_EMBUTIDO">Carnes y Embutidos</option>
            <option value="OTRO">Otros</option>
          </select>
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
          >
            <option value="ALL">Todos los estados</option>
            <option value="AVAILABLE">Disponibles</option>
            <option value="UNAVAILABLE">No disponibles</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-green-800">
                {product.name}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    router.push(`/dashboard/admin/products/edit/${product.id}`)
                  }
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Mercado:</span>{" "}
                {product.market?.name || "Sin asignar"}
              </p>
              {product.description && (
                <p className="text-gray-600">
                  <span className="font-medium">Descripción:</span>{" "}
                  {product.description}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-medium">Categoría:</span>{" "}
                {product.category}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Cantidad:</span>{" "}
                {product.quantity}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Estado:</span>{" "}
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.isAvailable ? "Disponible" : "No disponible"}
                </span>
              </p>
              {product.sasProgram && (
                <p className="text-gray-600">
                  <span className="font-medium">Programa SAS:</span>{" "}
                  <span className="text-green-600">✓</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-gray-600 mt-8">
          No se encontraron productos.
        </p>
      )}
    </div>
  );
}
