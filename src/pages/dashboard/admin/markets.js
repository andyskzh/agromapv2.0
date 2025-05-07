import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import BackToDashboard from "@/components/BackToDashboard";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

// Importar el mapa dinámicamente para evitar problemas con SSR
const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
});

export default function AdminMarketsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    managerId: "",
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
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [managers, setManagers] = useState([]);
  const [availableManagers, setAvailableManagers] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    fetchMarkets();
    fetchManagers();
  }, []);

  useEffect(() => {
    // Filtrar gestores disponibles (sin mercado asignado)
    const assignedManagerIds = markets.map((market) => market.managerId);
    const available = managers.filter(
      (manager) => !assignedManagerIds.includes(manager.id)
    );
    setAvailableManagers(available);
  }, [markets, managers]);

  const fetchMarkets = async () => {
    try {
      const res = await fetch("/api/admin/markets");
      const data = await res.json();
      if (res.ok) {
        setMarkets(data.markets || []);
      } else {
        setError(data.message || "Error al cargar los mercados");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar los mercados");
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) {
        const marketManagers = data.users.filter(
          (user) => user.role === "MARKET_MANAGER"
        );
        setManagers(marketManagers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSelect = (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este mercado?")) return;

    try {
      const res = await fetch(`/api/admin/markets/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMarkets((prev) => prev.filter((m) => m.id !== id));
      } else {
        const data = await res.json();
        setError(data.message || "Error al eliminar el mercado");
      }
    } catch (err) {
      console.error(err);
      setError("Error al eliminar el mercado");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validar campos requeridos
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
      if (formData.legalBeneficiary) {
        formDataToSend.append("legalBeneficiary", formData.legalBeneficiary);
      }
      if (formData.managerId) {
        formDataToSend.append("managerId", formData.managerId);
      }
      if (fileInputRef.current?.files[0]) {
        formDataToSend.append("image", fileInputRef.current.files[0]);
      }
      formDataToSend.append("schedule", JSON.stringify(formData.schedule));

      const res = await fetch("/api/admin/markets", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear el mercado");
      }

      // Cerrar el modal y resetear el formulario
      setShowForm(false);
      setFormData({
        name: "",
        location: "",
        description: "",
        managerId: "",
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
      setPreviewImage(null);
      setSelectedLocation(null);

      // Actualizar la lista de mercados
      fetchMarkets();

      // Mostrar mensaje de éxito
      alert("Mercado creado correctamente");
    } catch (err) {
      console.error("Error al crear mercado:", err);
      setError(err.message || "Error al procesar la solicitud");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackToDashboard />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-green-800">Mercados</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            {showForm ? "Cancelar" : "Crear nuevo mercado"}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-green-800">
                  Crear nuevo mercado
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beneficiario Legal
                  </label>
                  <input
                    type="text"
                    value={formData.legalBeneficiary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        legalBeneficiary: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

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
                                ? formData.schedule.days.filter(
                                    (d) => d !== day
                                  )
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
                        {formData.schedule.exceptions.map(
                          (exception, index) => (
                            <div
                              key={index}
                              className="flex gap-2 items-center"
                            >
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
                          )
                        )}
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gestor del mercado
                  </label>
                  <select
                    value={formData.managerId}
                    onChange={(e) =>
                      setFormData({ ...formData, managerId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Seleccionar gestor</option>
                    {availableManagers.map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({manager.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen del mercado
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                      id="market-image"
                    />
                    <label
                      htmlFor="market-image"
                      className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md text-gray-700"
                    >
                      Seleccionar imagen
                    </label>
                    {previewImage && (
                      <div className="relative w-20 h-20">
                        <Image
                          src={previewImage}
                          alt="Preview"
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coordenadas <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Latitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) =>
                          setFormData({ ...formData, latitude: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Longitud
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                  <Map
                    center={[4.6097, -74.0817]}
                    zoom={6}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Crear mercado
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {markets.map((market) => (
            <div
              key={market.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                {market.image ? (
                  <Image
                    src={market.image}
                    alt={market.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">Sin imagen</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {market.name}
                </h3>
                <p className="text-gray-600 mb-4">{market.location}</p>
                <p className="text-gray-500 text-sm mb-4">
                  {market.description || "Sin descripción"}
                </p>
                <div className="flex justify-between items-center">
                  <Link
                    href={`/dashboard/admin/markets/edit/${market.id}`}
                    className="text-green-600 hover:text-green-700"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(market.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
