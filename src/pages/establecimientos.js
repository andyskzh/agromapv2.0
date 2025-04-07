import { useState } from "react";
import dynamic from "next/dynamic";
import MarketList from "../components/MarketList";
import { prisma } from "../lib/prisma";
import Head from "next/head";

// Cargar el componente del mapa dinámicamente para evitar errores de SSR
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
});

export default function Establecimientos({ markets }) {
  const [selectedMarket, setSelectedMarket] = useState(null);

  return (
    <>
      <Head>
        <title>Establecimientos - AgroMap</title>
        <meta
          name="description"
          content="Encuentra los mercados más cercanos a ti"
        />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Lista de establecimientos */}
            <div className="md:col-span-1">
              <MarketList
                markets={markets}
                onMarketSelect={setSelectedMarket}
              />
            </div>

            {/* Mapa */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <MapComponent
                  markets={markets}
                  selectedMarket={selectedMarket}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps() {
  try {
    const markets = await prisma.market.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        image: true,
        latitude: true,
        longitude: true,
      },
    });

    return {
      props: {
        markets: JSON.parse(JSON.stringify(markets)),
      },
    };
  } catch (error) {
    console.error("Error fetching markets:", error);
    return {
      props: {
        markets: [],
      },
    };
  }
}
