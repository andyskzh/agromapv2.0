import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function EditProductAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    category: "OTRO",
    isAvailable: true,
    sasProgram: false,
    marketId: "",
  });
  const [markets, setMarkets] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchMarkets();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProduct(data.product);
        setFormData({
          name: data.product.name,
          description: data.product.description || "",
          quantity: data.product.quantity,
          category: data.product.category,
          isAvailable: data.product.isAvailable,
          sasProgram: data.product.sasProgram,
          marketId: data.product.marketId,
        });
      } else {
        setError(data.message || "Error al cargar el producto");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarkets = async () => {
    try {
      const res = await fetch("/api/admin/markets");
      const data = await res.json();
      if (res.ok) {
        setMarkets(data.markets || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al actualizar el producto");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/products");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Error al actualizar el producto");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!product) return <p className="p-6">Producto no encontrado</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        Editar Producto: {product.name}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
          Producto actualizado correctamente. Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Mercado *
          </label>
          <select
            value={formData.marketId}
            onChange={(e) =>
              setFormData({ ...formData, marketId: e.target.value })
            }
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecciona un mercado</option>
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Nombre *
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
            Cantidad *
          </label>
          <input
            type="number"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) })
            }
            required
            min="0"
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Categoría *
          </label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="FRUTA">Frutas</option>
            <option value="HORTALIZA">Hortalizas</option>
            <option value="VIANDA">Viandas</option>
            <option value="CARNE_EMBUTIDO">Carnes y Embutidos</option>
            <option value="OTRO">Otros</option>
          </select>
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center text-green-900 font-medium">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) =>
                setFormData({ ...formData, isAvailable: e.target.checked })
              }
              className="mr-2"
            />
            Disponible
          </label>

          <label className="flex items-center text-green-900 font-medium">
            <input
              type="checkbox"
              checked={formData.sasProgram}
              onChange={(e) =>
                setFormData({ ...formData, sasProgram: e.target.checked })
              }
              className="mr-2"
            />
            Potenciado por el programa SAS
          </label>
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
            onClick={() => router.push("/dashboard/admin/products")}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
