import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Importar el mapa dinámicamente para evitar problemas con SSR
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function CreateMarket() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [legalBeneficiary, setLegalBeneficiary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
    }
  }, [session, status]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Crear URL para vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setLatitude(lat.toString());
    setLongitude(lng.toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("latitude", latitude);
      formData.append("longitude", longitude);
      formData.append("legalBeneficiary", legalBeneficiary);

      // Agregar imagen si existe
      const imageFile = fileInputRef.current?.files[0];
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/market/create", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al crear el mercado");
        return;
      }

      router.push("/dashboard/manager");
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setError("Error al procesar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-3xl font-bold text-green-800 mb-6">
            Crear nuevo mercado
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Nombre del mercado *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ej: Mercado Central de La Habana"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Ubicación *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  placeholder="Ej: Calle 23 #123, La Habana"
                />
              </div>
            </div>

            {/* Beneficiario Legal */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Beneficiario Legal
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={legalBeneficiary}
                onChange={(e) => setLegalBeneficiary(e.target.value)}
                placeholder="Nombre del beneficiario legal"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe tu mercado, horarios, servicios especiales..."
              />
            </div>

            {/* Mapa y coordenadas */}
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Seleccionar ubicación en el mapa
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
                  <label className="block font-semibold text-gray-700 mb-2">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Ej: 19.4517"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Ej: -70.6970"
                  />
                </div>
              </div>
            </div>

            {/* Imagen del mercado */}
            <div>
              <label className="block font-semibold text-gray-700 mb-2">
                Imagen del mercado
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-green-500 transition-colors">
                <div className="space-y-1 text-center">
                  {previewImage ? (
                    <div className="relative w-48 h-48 mx-auto">
                      <Image
                        src={previewImage}
                        alt="Vista previa"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                    >
                      <span>Subir imagen</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                    </label>
                    <p className="pl-1">o arrastrar y soltar</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF hasta 5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creando..." : "Crear mercado"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard/manager")}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
