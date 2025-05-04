import React, { useState } from "react";
import { useRouter } from "next/router";
import BackButton from "@/components/BackButton";

const CreateMarket: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    latitude: "",
    longitude: "",
    image: null,
    legalBeneficiary: "",
  });
  const [error, setError] = useState("");
  const fileInputRef = React.useRef < HTMLInputElement > null;

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
      if (fileInputRef.current?.files[0]) {
        formDataToSend.append("image", fileInputRef.current.files[0]);
      }

      const res = await fetch("/api/market", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al crear el mercado");
      }

      alert("Mercado creado correctamente");
      router.push("/dashboard/market-manager/markets");
    } catch (err) {
      console.error("Error al crear mercado:", err);
      setError(err.message || "Error al procesar la solicitud");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <BackButton />
        <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-green-800 mb-6">
            Crear Nuevo Mercado
          </h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

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
                  setFormData({ ...formData, legalBeneficiary: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* ... resto del formulario existente ... */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateMarket;
