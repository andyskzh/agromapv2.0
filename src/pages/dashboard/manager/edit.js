import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaEdit, FaSave, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import dynamic from "next/dynamic";
import BackButton from "@/components/BackButton";

// Importar el mapa dinámicamente para evitar problemas con SSR
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function EditMarket() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [market, setMarket] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    latitude: "",
    longitude: "",
    image: null,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
      return;
    }

    fetchMarket();
  }, [session, status, router]);

  const fetchMarket = async () => {
    try {
      const res = await fetch("/api/market/my");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al cargar el mercado");
      }

      setMarket(data.market);
      setFormData({
        name: data.market.name || "",
        location: data.market.location || "",
        description: data.market.description || "",
        latitude: data.market.latitude?.toString() || "",
        longitude: data.market.longitude?.toString() || "",
        image: data.market.image || null,
      });

      if (data.market.latitude && data.market.longitude) {
        setSelectedLocation({
          lat: data.market.latitude,
          lng: data.market.longitude,
        });
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar el mercado");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationSelect = (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("description", formData.description);
      if (formData.latitude)
        formDataToSend.append("latitude", formData.latitude);
      if (formData.longitude)
        formDataToSend.append("longitude", formData.longitude);
      if (formData.image) formDataToSend.append("image", formData.image);

      const res = await fetch("/api/market/edit", {
        method: "PUT",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar el mercado");
      }

      setSuccess("Mercado actualizado correctamente");
      setTimeout(() => {
        router.push("/dashboard/manager");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Error al actualizar el mercado");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!market) return <p className="p-6">Mercado no encontrado</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Editar Mercado
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Nombre del mercado:
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Ubicación:
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Descripción:
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded p-2 text-gray-800"
                rows="3"
              />
            </div>

            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Seleccionar ubicación en el mapa:
              </label>
              <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300">
                <Map
                  selectedLocation={selectedLocation}
                  onLocationSelect={handleLocationSelect}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Haz clic en el mapa para marcar la ubicación exacta de tu
                mercado
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-green-900 mb-1">
                  Latitud:
                </label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-gray-800"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block font-semibold text-green-900 mb-1">
                  Longitud:
                </label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 text-gray-800"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-green-900 mb-1">
                Imagen del mercado:
              </label>
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setFormData({ ...formData, image: e.target.files[0] });
                  }
                }}
                className="w-full border border-gray-300 rounded p-2 text-gray-800"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <FaSave className="mr-2" />
                Guardar cambios
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/manager")}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <FaTimes className="mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
