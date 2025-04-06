import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CreateProductAdmin() {
  const router = useRouter();

  const [form, setForm] = useState({
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
  const [loading, setLoading] = useState(false);

  const CATEGORIES = ["FRUTA", "HORTALIZA", "VIANDA", "CARNE_EMBUTIDO", "OTRO"];

  useEffect(() => {
    fetchMarkets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const res = await fetch("/api/admin/markets");
      const data = await res.json();
      if (res.ok) {
        setMarkets(data.markets || []);
      } else {
        setError(data.message || "Error al cargar mercados");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar mercados");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al crear producto");
        return;
      }

      router.push("/dashboard/admin/products");
    } catch (err) {
      console.error(err);
      setError("Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-900 mb-6 text-center">
        Crear Producto
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mercado */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Mercado *
          </label>
          <select
            name="marketId"
            value={form.marketId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecciona un mercado</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Cantidad */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Cantidad *
          </label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            required
            min="0"
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Categoría
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Disponibilidad y SAS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="font-semibold text-green-900">Disponible</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="sasProgram"
              checked={form.sasProgram}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="font-semibold text-green-900">Programa SAS</label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/products")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
