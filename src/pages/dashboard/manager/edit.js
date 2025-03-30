import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function EditMarket() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [market, setMarket] = useState(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
    } else {
      fetchMarket();
    }
  }, [session, status]);

  const fetchMarket = async () => {
    try {
      const res = await fetch("/api/market/my");
      const data = await res.json();
      if (res.ok) {
        setMarket(data.market);
        setName(data.market.name);
        setLocation(data.market.location);
        setDescription(data.market.description || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/market/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, location, description }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Error al actualizar el mercado");
      return;
    }

    router.push("/dashboard/manager");
  };

  if (!market) return <p className="p-6">Cargando datos del mercado...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Editar mercado</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Nombre del mercado *
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded text-gray-500"
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
            className="w-full border p-2 rounded text-gray-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Descripción
          </label>
          <textarea
            className="w-full border p-2 rounded text-gray-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
