import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

// Corregir el problema de los íconos de marcadores en Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapComponent = ({ markets }) => {
  const [center, setCenter] = useState([19.4517, -70.697]); // Coordenadas de Santiago, RD

  useEffect(() => {
    // Obtener la ubicación del usuario si está disponible
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error obteniendo la ubicación:", error);
        }
      );
    }
  }, []);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "600px", width: "100%" }}
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
    </MapContainer>
  );
};

export default MapComponent;
