import { useRouter } from "next/router";
import { FaStore } from "react-icons/fa";

export default function ProductCard({ product }) {
  const router = useRouter();
  const isBaseProduct = !product.markets || product.markets.length === 0;

  // Asegurarnos de que no haya mercados duplicados
  const uniqueMarkets = product.markets
    ? [...new Set(product.markets.map((market) => market.id))].length
    : 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition-shadow">
      <img
        src={product.image || "/placeholder-product.jpg"}
        alt={product.name}
        className="w-full h-36 object-contain mb-4"
      />
      <h4 className="text-lg font-bold mb-2 text-gray-700">{product.name}</h4>

      <div className="text-sm mb-3">
        {isBaseProduct ? (
          <span className="text-gray-500 italic">Producto base</span>
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
        onClick={() => router.push(`/productos/${product.id}`)}
        className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition font-semibold w-full"
      >
        {isBaseProduct ? "Ver Detalles" : "Ver Disponibilidad"}
      </button>
    </div>
  );
}
