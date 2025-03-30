import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function CreateProduct() {
  const router = useRouter();
  const [baseProducts, setBaseProducts] = useState([]);
  const [selectedBase, setSelectedBase] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [referenceImage, setReferenceImage] = useState("");

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
  });

  const [error, setError] = useState("");

  const CATEGORIES = [
    "FRUTA",
    "HORTALIZA",
    "VIANDA",
    "CARNE_Y_EMBUTIDO",
    "OTRO",
  ];

  const UNITS = ["kg", "lb", "unidad"];
  const PRICE_TYPES = ["unidad", "lb"];

  useEffect(() => {
    fetch("/api/product-bases")
      .then((res) => res.json())
      .then((data) => setBaseProducts(data));
  }, []);

  const handleBaseSelect = (e) => {
    const id = e.target.value;
    const base = baseProducts.find((p) => p.id === id);
    if (base) {
      setSelectedBase(base);
      setReferenceImage(base.image || "");
      setForm((prev) => ({
        ...prev,
        name: base.name || "",
        description: base.description || "",
        nutrition: base.nutrition || "",
        category: base.category || "OTRO",
        quantity: "",
        unit: "kg",
        price: "",
        priceType: "unidad",
        isAvailable: false,
        sasProgram: false,
      }));
    }
  };

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

    // Añadir campos
    for (const key in form) {
      if (key === "images") {
        form.images.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, form[key]);
      }
    }

    // Si no hay imágenes subidas y hay imagen de referencia, añádela
    if (form.images.length === 0 && referenceImage) {
      formData.append("referenceImage", referenceImage);
    }

    const res = await fetch("/api/products/create", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Error al crear producto");
      return;
    }

    router.push("/dashboard/manager/products");
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6 text-center">
        Añadir producto
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Producto base */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Producto base (opcional)
          </label>
          <select
            className="w-full border rounded p-2 text-gray-500"
            onChange={handleBaseSelect}
            defaultValue=""
          >
            <option value="" disabled>
              Selecciona un producto base...
            </option>
            {baseProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Imágenes */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Imagen(es):
          </label>
          <div className="flex flex-wrap gap-3">
            {referenceImage && (
              <div className="w-24 h-24 border rounded bg-gray-100 overflow-hidden">
                <img
                  src={referenceImage}
                  alt="Referencia"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {previewImages.map((src, i) => (
              <div
                key={i}
                className="w-24 h-24 border rounded overflow-hidden bg-gray-100"
              >
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

        {/* Nombre */}
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
            className="w-full border rounded p-2 text-gray-500"
          />
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
            className="w-full border rounded p-2 text-gray-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Descripción:
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded p-2 text-gray-500"
          />
        </div>

        {/* Nutrición */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Información nutricional:
          </label>
          <textarea
            name="nutrition"
            value={form.nutrition}
            onChange={handleChange}
            rows={2}
            className="w-full border rounded p-2 text-gray-500"
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
              required
              className="w-full border rounded p-2 text-gray-500"
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
              className="w-full border rounded p-2 text-gray-500"
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
              className="w-full border rounded p-2 text-gray-500"
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
              className="w-full border rounded p-2 text-gray-500"
            >
              {PRICE_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
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
            Potenciado por el programa SAS-Cuba
          </label>
        </div>

        {error && <p className="text-red-600 text-sm text-center">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded"
        >
          Añadir
        </button>
      </form>
    </div>
  );
}
