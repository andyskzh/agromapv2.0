import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CreateProductAdmin() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    description: "",
    nutrition: "",
    quantity: "",
    unit: "kg",
    price: "",
    priceType: "unidad",
    category: "FRUTA",
    isAvailable: false,
    sasProgram: false,
    images: [],
    marketId: "",
  });

  const [markets, setMarkets] = useState([]);
  const [error, setError] = useState("");
  const [previewImages, setPreviewImages] = useState([]);

  const UNITS = ["kg", "lb", "unidad"];
  const PRICE_TYPES = ["unidad", "lb"];
  const CATEGORIES = ["FRUTA", "HORTALIZA", "VIANDA", "CARNE_Y_EMBUTIDO", "OTRO"];

  useEffect(() => {
    fetch("/api/admin/markets")
      .then((res) => res.json())
      .then((data) => setMarkets(data.markets || []));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setForm({ ...form, [name]: checked });
    } else if (type === "file") {
      const imageFiles = Array.from(files);
      setForm({ ...form, images: imageFiles });
      const previews = imageFiles.map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in form) {
      if (key === "images") {
        form.images.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, form[key]);
      }
    }

    const res = await fetch("/api/admin/products", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Error al crear producto");
      return;
    }

    router.push("/dashboard/admin/products");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-900 mb-6 text-center">
        Crear Producto
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mercado */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Mercado:
          </label>
          <select
            name="marketId"
            value={form.marketId}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Selecciona un mercado</option>
            {markets.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Resto de campos: nombre, descripción, etc. */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Nombre:
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Descripción:
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={2}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Información nutricional:
          </label>
          <textarea
            name="nutrition"
            value={form.nutrition}
            onChange={handleChange}
            rows={2}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Cantidad y unidad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Cantidad:
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Unidad:
            </label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Precio y tipo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Precio:
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Precio por:
            </label>
            <select
              name="priceType"
              value={form.priceType}
              onChange={handleChange}
              className="w-full border rounded p-2"
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
            Categoría:
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Switches */}
        <div className="flex items-center gap-6">
          <label className="flex items-center text-green-900 font-medium">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.isAvailable}
              onChange={handleChange}
              className="mr-2"
            />
            Disponible
          </label>

          <label className="flex items-center text-green-900 font-medium">
            <input
              type="checkbox"
              name="sasProgram"
              checked={form.sasProgram}
              onChange={handleChange}
              className="mr-2"
            />
            Potenciado por el programa SAS
          </label>
        </div>

        {/* Imágenes */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Imagen(es):
          </label>
          <div className="flex flex-wrap gap-3">
            {previewImages.map((src, i) => (
              <div key={i} className="w-24 h-24 border rounded overflow-hidden bg-gray-100">
                <img
                  src={src}
                  alt={`Imagen ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            <label className="w-24 h-24 border rounded flex items-center justify-center bg-gray-100 cursor-pointer text-gray-500 text-2xl">
              +
              <input
                type="file"
                name="images"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
        >
          Crear producto
        </button>
      </form>
    </div>
  );
}
