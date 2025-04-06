import { useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";

export default function CreateBaseProductAdmin() {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: "",
    image: "",
    category: "OTRO",
    nutrition: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const CATEGORIES = ["FRUTA", "HORTALIZA", "VIANDA", "CARNE_EMBUTIDO", "OTRO"];

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/products/base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al crear el producto base");
        return;
      }

      router.push("/dashboard/admin/products/base");
    } catch (err) {
      console.error(err);
      setError("Error al crear el producto base");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-green-900 mb-6 text-center">
        Crear Producto Base
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
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
            Categoría *
          </label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.replace("_", " ")}
              </option>
            ))}
          </select>
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
            rows={4}
            className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Ingrese la información nutricional del producto"
          />
        </div>

        {/* Imagen */}
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Imagen *
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
                required
                className="w-full border rounded p-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Sube una imagen para el producto base.
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/products/base")}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? "Creando..." : "Crear Producto Base"}
          </button>
        </div>
      </form>
    </div>
  );
}
