import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function CreateMarket() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    console.log("Estado de sesión:", {
      status,
      session,
      role: session?.user?.role
    });
    if (!session || session.user.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
    }
  }, [session, status]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/market/create", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include", // Importante: incluir credenciales
        body: JSON.stringify({ name, location, description }),
      });

      const data = await res.json();
      console.log("Respuesta del servidor:", { status: res.status, data }); // Debug

      if (!res.ok) {
        setError(data.message || "Error al crear el mercado");
        return;
      }

      router.push("/dashboard/manager");
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setError("Error al procesar la solicitud");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Crear mercado</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Nombre del mercado *
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded text-gray-800"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Ubicación *
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded text-gray-800"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Descripción (opcional)
          </label>
          <textarea
            className="w-full border p-2 rounded text-gray-800"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Crear mercado
        </button>
      </form>
    </div>
  );
}
