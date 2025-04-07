import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Icono más pequeño para los marcadores
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [20, 32], // Reducido de [25, 41]
  iconAnchor: [10, 32], // Ajustado proporcionalmente
  popupAnchor: [1, -34],
  shadowSize: [32, 32], // Reducido proporcionalmente
});

// Componente para manejar el zoom a un mercado específico
function FlyToMarket({ market, map }) {
  useEffect(() => {
    if (market && map) {
      map.flyTo([market.latitude, market.longitude], 15, {
        duration: 1.5,
      });
    }
  }, [market, map]);

  return null;
}

const MapComponent = ({ markets, selectedMarket }) => {
  // Centro inicial en una posición entre Villa Clara y Sancti Spíritus
  const [center] = useState([22.0749, -79.8007]);
  const [map, setMap] = useState(null);

  return (
    <MapContainer
      center={center}
      zoom={9}
      style={{ height: "calc(100vh - 100px)", width: "100%" }}
      ref={setMap}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markets.map((market) => (
        <Marker
          key={market.id}
          position={[market.latitude, market.longitude]}
          icon={icon}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-lg">{market.name}</h3>
              {market.image && (
                <div className="relative h-32 w-full my-2">
                  <img
                    src={market.image}
                    alt={market.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <p className="text-sm text-gray-600">{market.description}</p>
              <button
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() =>
                  (window.location.href = `/mercados/${market.id}`)
                }
              >
                Ver más información
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
      {selectedMarket && <FlyToMarket market={selectedMarket} map={map} />}
    </MapContainer>
  );
};

export default MapComponent;
