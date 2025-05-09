import { useRouter } from "next/router";
import { FaStore, FaTimesCircle } from "react-icons/fa";
import { useState } from "react";

export default function ProductCard({ product }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const isBaseProduct = !product.markets || product.markets.length === 0;

  // Asegurarnos de que no haya mercados duplicados
  const uniqueMarkets = product.markets
    ? [...new Set(product.markets.map((market) => market.id))].length
    : 0;

  const handleClick = () => {
    if (isBaseProduct) {
      setShowModal(true);
    } else {
      // Usamos el ID del primer mercado disponible
      const firstMarket = product.markets[0];
      router.push(`/productos/${firstMarket.productId}`);
    }
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition-shadow">
        <img
          src={product.image || "/placeholder-product.jpg"}
          alt={product.name}
          className="w-full h-36 object-contain mb-4"
        />
        <h4 className="text-lg font-bold mb-2 text-gray-700">{product.name}</h4>

        <div className="text-sm mb-3">
          {isBaseProduct ? (
            <div className="flex items-center justify-center text-red-600">
              <FaTimesCircle className="mr-1" />
              <span className="font-medium">No disponible</span>
            </div>
          ) : (
            <div className="flex items-center justify-center text-green-600">
              <FaStore className="mr-1" />
              <span className="font-medium">
                Disponible en {uniqueMarkets} mercado
                {uniqueMarkets !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={handleClick}
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition font-semibold w-full"
        >
          {isBaseProduct ? "Ver Detalles" : "Ver Disponibilidad"}
        </button>
      </div>

      {/* Modal para productos no disponibles */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Producto no disponible
            </h3>
            <p className="text-gray-600 mb-4">
              Este producto aún no está disponible en ningún mercado.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
