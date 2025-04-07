import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";

// Importar el componente del mapa dinámicamente para evitar problemas de SSR
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
});

export default function Establecimientos() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch("/api/markets");
        const data = await response.json();
        setMarkets(data);
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, []);

  return (
    <>
      <Head>
        <title>Establecimientos - AgroMap</title>
        <meta
          name="description"
          content="Encuentra los mercados más cercanos a ti"
        />
      </Head>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Establecimientos</h1>

        {loading ? (
          <div className="flex justify-center items-center h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-4">
            <MapComponent markets={markets} />
          </div>
        )}
      </div>
    </>
  );
}
