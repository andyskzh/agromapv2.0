import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function EditProduct() {
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
    baseProductId: "",
    image: "",
  });

  const [baseProducts, setBaseProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const UNITS = ["kg", "lb", "unidad"];
  const PRICE_TYPES = ["unidad", "lb"];
  const CATEGORIES = ["FRUTA", "HORTALIZA", "VIANDA", "CARNE_EMBUTIDO", "OTRO"];

  useEffect(() => {
    if (session?.user?.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
      return;
    }

    if (id) {
      fetchProduct();
      fetchBaseProducts();
    }
  }, [id, session]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/manager/products/${id}`);
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
          baseProductId: data.product.baseProductId || "",
          image: data.product.image || "",
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

  const fetchBaseProducts = async () => {
    try {
      const res = await fetch("/api/product-bases");
      const data = await res.json();
      if (res.ok) {
        setBaseProducts(data || []);
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
          description: `Información nutricional: ${selectedBaseProduct.nutrition}\n\n${form.description}`,
          category: selectedBaseProduct.category,
          image: selectedBaseProduct.image,
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
      const res = await fetch(`/api/manager/products/${id}`, {
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
        router.push("/dashboard/manager/products");
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
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cambiar imagen
              <input
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          </div>
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
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="4"
            placeholder="Descripción del producto (la información nutricional se agregará automáticamente si selecciona un producto base)"
          />
        </div>

        {/* Cantidad y unidad */}
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
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Precio y tipo de precio */}
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
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Tipo de precio
            </label>
            <select
              name="priceType"
              value={form.priceType}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {PRICE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Opciones adicionales */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Producto disponible
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="sasProgram"
              checked={form.sasProgram}
              onChange={handleChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Incluido en programa SAS
            </label>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Actualizando..." : "Actualizar producto"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/manager/products")}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
