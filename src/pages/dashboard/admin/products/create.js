import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function CreateProductAdmin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

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
    images: [],
  });

  const [markets, setMarkets] = useState([]);
  const [baseProducts, setBaseProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewImages, setPreviewImages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const UNITS = ["kg", "lb", "unidad"];
  const PRICE_TYPES = ["unidad", "lb"];
  const CATEGORIES = ["FRUTA", "HORTALIZA", "VIANDA", "CARNE_EMBUTIDO", "OTRO"];

  useEffect(() => {
    if (status === "authenticated") {
      fetchMarkets();
      fetchBaseProducts();
    }
  }, [status]);

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
      if (name === "image") {
        // Manejar la imagen principal
        if (files && files.length > 0) {
          const file = files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviewImage(reader.result);
            setFormData({ ...formData, image: reader.result });
          };
          reader.readAsDataURL(file);
        }
      } else if (name === "images") {
        // Manejar múltiples imágenes
        if (files && files.length > 0) {
          const newImages = [...formData.images];
          const newPreviewImages = [...previewImages];

          Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              newImages.push(reader.result);
              newPreviewImages.push(reader.result);
              setFormData({ ...formData, images: newImages });
              setPreviewImages(newPreviewImages);
            };
            reader.readAsDataURL(file);
          });
        }
      }
    } else if (name === "name") {
      // Manejar el autocompletado del nombre
      setFormData({ ...formData, [name]: value });

      // Buscar coincidencias en productos base
      if (value.length > 2) {
        const matches = baseProducts.filter((product) =>
          product.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(matches);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else if (name === "baseProductId") {
      // Manejar la selección del producto base
      const selectedProduct = baseProducts.find((p) => p.id === value);
      if (selectedProduct) {
        setFormData({
          ...formData,
          name: selectedProduct.name,
          description: `Información nutricional: ${selectedProduct.nutrition}\n\n${formData.description}`,
          category: selectedProduct.category,
          image: selectedProduct.image,
          baseProductId: value,
        });
        setPreviewImage(selectedProduct.image);
      } else {
        setFormData({ ...formData, baseProductId: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSuggestionClick = (product) => {
    setFormData({
      ...formData,
      name: product.name,
      description: `Información nutricional: ${product.nutrition}\n\n${formData.description}`,
      category: product.category,
      image: product.image,
      baseProductId: product.id,
    });
    setPreviewImage(product.image);
    setSuggestions([]);
    setShowSuggestions(false);
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

  if (status === "loading") {
    return <div>Cargando...</div>;
  }

  if (status === "unauthenticated") {
    return null;
  }

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
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Producto Base
          </label>
          <select
            name="baseProductId"
            value={formData.baseProductId}
            onChange={handleChange}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
          >
            <option value="">Seleccione un producto base (opcional)</option>
            {baseProducts.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nombre con autocompletado */}
        <div className="relative">
          <label className="block font-semibold text-green-900 mb-1">
            Nombre *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
              {suggestions.map((product) => (
                <div
                  key={product.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(product)}
                >
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Imagen principal */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Imagen Principal
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
            </div>
          </div>
        </div>

        {/* Imágenes adicionales */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Imágenes Adicionales
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {previewImages.map((img, index) => (
              <div key={index} className="relative">
                <img
                  src={img}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = [...formData.images];
                    const newPreviewImages = [...previewImages];
                    newImages.splice(index, 1);
                    newPreviewImages.splice(index, 1);
                    setFormData({ ...formData, images: newImages });
                    setPreviewImages(newPreviewImages);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            name="images"
            onChange={handleChange}
            accept="image/*"
            multiple
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
          />
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
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
          >
            <option value="">Selecciona un mercado</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
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
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-gray-800"
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
              className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-800"
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
              value={formData.price}
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
              value={formData.priceType}
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

        {/* Categoría */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Categoría
          </label>
          <select
            name="category"
            value={formData.category}
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
