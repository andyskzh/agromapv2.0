import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { FaEdit, FaSave, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import dynamic from "next/dynamic";
import BackButton from "@/components/BackButton";
import Image from "next/image";

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
    legalBeneficiary: "",
    schedule: {
      openTime: "08:00",
      closeTime: "17:00",
      days: [],
      exceptions: [],
    },
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

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

      // Procesar los horarios
      const regularSchedule = data.market.schedules.find((s) => !s.isException);
      const exceptions = data.market.schedules.filter((s) => s.isException);

      setFormData({
        name: data.market.name,
        location: data.market.location,
        description: data.market.description || "",
        latitude: data.market.latitude?.toString() || "",
        longitude: data.market.longitude?.toString() || "",
        image: data.market.image || null,
        legalBeneficiary: data.market.legalBeneficiary || "",
        schedule: {
          openTime: regularSchedule?.openTime || "08:00",
          closeTime: regularSchedule?.closeTime || "17:00",
          days: regularSchedule?.days || [],
          exceptions: exceptions.map((e) => ({
            day: e.day,
            openTime: e.openTime,
            closeTime: e.closeTime,
          })),
        },
      });
      setPreviewImage(data.market.image || null);
      if (data.market.latitude && data.market.longitude) {
        setSelectedLocation({
          lat: data.market.latitude,
          lng: data.market.longitude,
        });
      }
    } catch (err) {
      console.error("Error al cargar mercado:", err);
      setError(err.message || "Error al cargar el mercado");
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

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData({ ...formData, image: e.target.files[0] });
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.location ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setError("Por favor, complete todos los campos requeridos (*)");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("latitude", formData.latitude);
      formDataToSend.append("longitude", formData.longitude);
      formDataToSend.append("legalBeneficiary", formData.legalBeneficiary);
      formDataToSend.append("schedule", JSON.stringify(formData.schedule));
      if (fileInputRef.current?.files[0]) {
        formDataToSend.append("image", fileInputRef.current.files[0]);
      }

      const res = await fetch("/api/market/edit", {
        method: "PUT",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al actualizar el mercado");
      }

      alert("Mercado actualizado correctamente");
      router.push("/dashboard/manager");
    } catch (err) {
      console.error("Error al actualizar mercado:", err);
      setError(err.message || "Error al procesar la solicitud");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!formData.name) return <p className="p-6">Cargando mercado...</p>;

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del mercado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Beneficiario Legal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiario Legal
              </label>
              <input
                type="text"
                value={formData.legalBeneficiary}
                onChange={(e) =>
                  setFormData({ ...formData, legalBeneficiary: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Nombre del beneficiario legal"
              />
            </div>

            {/* Horario de Operación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horario de Operación
              </label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Hora de Apertura
                    </label>
                    <input
                      type="time"
                      value={formData.schedule.openTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: {
                            ...formData.schedule,
                            openTime: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Hora de Cierre
                    </label>
                    <input
                      type="time"
                      value={formData.schedule.closeTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: {
                            ...formData.schedule,
                            closeTime: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Días de Operación
                  </label>
                  <div className="grid grid-cols-7 gap-2">
                    {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          const days = formData.schedule.days.includes(day)
                            ? formData.schedule.days.filter((d) => d !== day)
                            : [...formData.schedule.days, day];
                          setFormData({
                            ...formData,
                            schedule: {
                              ...formData.schedule,
                              days,
                            },
                          });
                        }}
                        className={`p-2 rounded-md ${
                          formData.schedule.days.includes(day)
                            ? "bg-green-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Excepciones
                  </label>
                  <div className="space-y-2">
                    {formData.schedule.exceptions.map((exception, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          value={exception.day}
                          onChange={(e) => {
                            const exceptions = [
                              ...formData.schedule.exceptions,
                            ];
                            exceptions[index].day = e.target.value;
                            setFormData({
                              ...formData,
                              schedule: {
                                ...formData.schedule,
                                exceptions,
                              },
                            });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Seleccionar día</option>
                          <option value="L">Lunes</option>
                          <option value="M">Martes</option>
                          <option value="X">Miércoles</option>
                          <option value="J">Jueves</option>
                          <option value="V">Viernes</option>
                          <option value="S">Sábado</option>
                          <option value="D">Domingo</option>
                        </select>
                        <input
                          type="time"
                          value={exception.openTime}
                          onChange={(e) => {
                            const exceptions = [
                              ...formData.schedule.exceptions,
                            ];
                            exceptions[index].openTime = e.target.value;
                            setFormData({
                              ...formData,
                              schedule: {
                                ...formData.schedule,
                                exceptions,
                              },
                            });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="time"
                          value={exception.closeTime}
                          onChange={(e) => {
                            const exceptions = [
                              ...formData.schedule.exceptions,
                            ];
                            exceptions[index].closeTime = e.target.value;
                            setFormData({
                              ...formData,
                              schedule: {
                                ...formData.schedule,
                                exceptions,
                              },
                            });
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const exceptions =
                              formData.schedule.exceptions.filter(
                                (_, i) => i !== index
                              );
                            setFormData({
                              ...formData,
                              schedule: {
                                ...formData.schedule,
                                exceptions,
                              },
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          schedule: {
                            ...formData.schedule,
                            exceptions: [
                              ...formData.schedule.exceptions,
                              {
                                day: "",
                                openTime: "08:00",
                                closeTime: "17:00",
                              },
                            ],
                          },
                        });
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      + Agregar Excepción
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Describe tu mercado"
              />
            </div>

            {/* Mapa y coordenadas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar ubicación en el mapa
                </label>
                <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                  <Map
                    center={selectedLocation || [4.6097, -74.0817]}
                    zoom={selectedLocation ? 15 : 6}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitud <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="Ej: 4.6097"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitud <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    placeholder="Ej: -74.0817"
                  />
                </div>
              </div>
            </div>

            {/* Imagen del mercado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
