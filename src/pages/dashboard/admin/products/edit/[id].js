import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import BackButton from "@/components/BackButton";

export default function EditProductAdmin() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();

  const [form, setForm] = useState({
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
    image: "",
    type: "",
    nutrition: "",
  });

  const [markets, setMarkets] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const UNITS = ["kg", "lb", "unidad"];
  const PRICE_TYPES = ["unidad", "lb"];
  const CATEGORIES = ["FRUTA", "HORTALIZA", "VIANDA", "CARNE_EMBUTIDO", "OTRO"];

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }

    if (id) {
      fetchProduct();
      fetchMarkets();
      fetchBaseProducts();
    }
  }, [id, session]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        setForm({
          name: data.product.name,
          description: data.product.description || "",
          quantity: data.product.quantity,
          unit: data.product.unit || "kg",
          price: data.product.price || "",
          priceType: data.product.priceType || "unidad",
          category: data.product.category,
          isAvailable: data.product.isAvailable,
          sasProgram: data.product.sasProgram,
          marketId: data.product.marketId,
          baseProductId: data.product.baseProductId || "",
          image: data.product.image || "",
          type: data.product.type || "",
          nutrition: data.product.nutrition || "",
        });
        if (data.product.image) {
          setPreviewImage(data.product.image);
        }
      } else {
        setError(data.message || "Error al cargar el producto");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar el producto");
    }
  };

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
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      // Manejar la subida de imágenes
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          setPreviewImage(reader.result);
          setForm({ ...form, image: reader.result });
        };

        reader.readAsDataURL(file);
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleBaseProductChange = (e) => {
    const baseProductId = e.target.value;
    setForm({ ...form, baseProductId });

    if (baseProductId) {
      const selectedBaseProduct = baseProducts.find(
        (bp) => bp.id === baseProductId
      );
      if (selectedBaseProduct) {
        setForm({
          ...form,
          baseProductId,
          name: selectedBaseProduct.name,
          description: selectedBaseProduct.description || "",
          category: selectedBaseProduct.category,
          image: selectedBaseProduct.image,
          nutrition: selectedBaseProduct.nutrition || "",
        });
        setPreviewImage(selectedBaseProduct.image);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al actualizar el producto");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/products");
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Error al actualizar el producto");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.name) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <BackButton />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-green-900 mb-6 text-center">
          Editar Producto
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
            Producto actualizado exitosamente
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Producto Base */}
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Producto Base (opcional)
            </label>
            <select
              name="baseProductId"
              value={form.baseProductId}
              onChange={handleBaseProductChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
            >
              <option value="">Selecciona un producto base</option>
              {baseProducts.map((bp) => (
                <option key={bp.id} value={bp.id}>
                  {bp.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Al seleccionar un producto base, se copiará su información
              nutricional en la descripción.
            </p>
          </div>

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
              className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
                value={form.quantity}
                onChange={handleChange}
                required
                min="0"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Unidad
              </label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Precio por
              </label>
              <select
                name="priceType"
                value={form.priceType}
                onChange={handleChange}
                className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
              >
                {PRICE_TYPES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Tipo (opcional)
            </label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="Ej: Tomate cherry, Mango importado, etc."
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
            />
          </div>

          {/* Información Nutricional */}
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Información Nutricional
            </label>
            <textarea
              name="nutrition"
              value={form.nutrition}
              onChange={handleChange}
              placeholder="Ingrese la información nutricional específica de este producto (opcional)"
              rows={4}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
            />
            <p className="mt-1 text-sm text-gray-500">
              Si no se especifica, se usará la información nutricional del
              producto base.
            </p>
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
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
              <label className="font-semibold text-green-900">
                Programa SAS
              </label>
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
                  className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Sube una imagen para el producto o selecciona un producto
                  base.
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
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
