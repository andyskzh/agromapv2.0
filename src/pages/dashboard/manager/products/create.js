import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function CreateProduct() {
  const router = useRouter();
  const [baseProducts, setBaseProducts] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    baseProductId: "",
    image: null,
  });

  const UNITS = ["kg", "lb", "unidad"];
  const PRICE_TYPES = ["unidad", "lb"];
  const CATEGORIES = ["FRUTA", "HORTALIZA", "VIANDA", "CARNE_EMBUTIDO", "OTRO"];

  useEffect(() => {
    fetchBaseProducts();
  }, []);

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
        setPreviewImage(selectedBaseProduct.image);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al crear producto");
        return;
      }

      router.push("/dashboard/manager/products");
    } catch (err) {
      console.error(err);
      setError("Error al crear producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6 text-center">
        Añadir producto
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Producto base */}
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

        {/* Imagen */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Imagen:
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
            value={formData.name}
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
            value={formData.category}
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
            value={formData.description}
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
              value={formData.price}
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
              value={formData.priceType}
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
              checked={formData.isAvailable}
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
              checked={formData.sasProgram}
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
            {loading ? "Creando..." : "Crear producto"}
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
