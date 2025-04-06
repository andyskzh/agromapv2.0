import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CreateProductAdmin() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    unit: "kg",
    price: "",
    priceType: "unidad",
    category: "OTRO",
    isAvailable: true,
    sasProgram: false,
    marketId: "",
    baseProductId: "",
    image: null,
  });

  const [markets, setMarkets] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const UNITS = ["kg", "lb", "unidad"];
  const PRICE_TYPES = ["unidad", "lb"];
  const CATEGORIES = ["FRUTA", "HORTALIZA", "VIANDA", "CARNE_EMBUTIDO", "OTRO"];

  useEffect(() => {
    fetchMarkets();
    fetchBaseProducts();
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

  const fetchBaseProducts = async () => {
    try {
      const res = await fetch("/api/admin/products/base");
      const data = await res.json();
      if (res.ok) {
        setBaseProducts(data.baseProducts || []);
      } else {
        setError(data.message || "Error al cargar productos base");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar productos base");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      // Manejar la subida de imágenes
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          setPreviewImage(reader.result);
          setFormData({ ...formData, image: reader.result });
        };

        reader.readAsDataURL(file);
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleBaseProductChange = (e) => {
    const selectedBaseProductId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      baseProductId: selectedBaseProductId,
    }));

    if (selectedBaseProductId) {
      const selectedBaseProduct = baseProducts.find(
        (bp) => bp.id === selectedBaseProductId
      );
      if (selectedBaseProduct) {
        setFormData((prev) => ({
          ...prev,
          name: selectedBaseProduct.name,
          description: `Información nutricional: ${selectedBaseProduct.nutrition}\n\n${prev.description}`,
          category: selectedBaseProduct.category,
          image: selectedBaseProduct.image,
        }));
      }
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
        body: JSON.stringify(formData),
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
        {/* Producto Base */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Producto Base
          </label>
          <select
            name="baseProductId"
            value={formData.baseProductId}
            onChange={handleBaseProductChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">Seleccione un producto base (opcional)</option>
            {baseProducts.map((baseProduct) => (
              <option key={baseProduct.id} value={baseProduct.id}>
                {baseProduct.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Al seleccionar un producto base, se copiará su información
            nutricional en la descripción
          </p>
        </div>

        {/* Mercado */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Mercado *
          </label>
          <select
            name="marketId"
            value={formData.marketId}
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
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="4"
            placeholder="Descripción del producto (la información nutricional se agregará automáticamente si selecciona un producto base)"
          />
        </div>

        {/* Cantidad y Unidad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Cantidad *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Unidad
            </label>
            <select
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Precio y Tipo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Precio
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Precio por
            </label>
            <select
              name="priceType"
              value={formData.priceType}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {PRICE_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Categoría
          </label>
          <select
            name="category"
            value={formData.category}
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
              checked={formData.isAvailable}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="font-semibold text-green-900">Disponible</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="sasProgram"
              checked={formData.sasProgram}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="font-semibold text-green-900">Programa SAS</label>
          </div>
        </div>

        {/* Imagen */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Imagen
          </label>
          <div className="flex items-center space-x-4">
            {previewImage && (
              <div className="w-24 h-24 border rounded overflow-hidden">
                <img
                  src={previewImage}
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                name="image"
                onChange={handleChange}
                accept="image/*"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Sube una imagen para el producto o selecciona un producto base.
              </p>
            </div>
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
