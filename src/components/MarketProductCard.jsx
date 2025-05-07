import { useRouter } from "next/router";
import { FaStore, FaCheckCircle, FaTimesCircle, FaStar } from "react-icons/fa";

export default function MarketProductCard({ product, hideMarket = false }) {
  const router = useRouter();
  const isAvailable = product.isAvailable !== false; // Si no está definido, asumimos que está disponible

  // Determinar qué imagen usar
  const productImage =
    product.images?.[0] ||
    product.image ||
    product.baseProduct?.image ||
    "/placeholder-product.jpg";

  // Formatear el precio
  const formatPrice = (price, priceType) => {
    if (!price) return "Precio no disponible";
    return `${price.toFixed(2)} CUP/${priceType}`;
  };

  // Calcular la valoración promedio
  const averageRating = product.rating || 0;
  const hasRating = averageRating > 0;

  return (
    <div className="bg-white p-4 rounded-lg shadow text-center hover:shadow-lg transition-shadow">
      <img
        src={productImage}
        alt={product.name}
        className="w-full h-36 object-contain mb-4"
      />
      <h4 className="text-lg font-bold mb-2 text-gray-700">{product.name}</h4>

      {!hideMarket && (
        <div className="text-sm mb-2">
          <div className="flex items-center justify-center text-gray-600">
            <FaStore className="mr-1" />
            <span className="font-medium">
              {product.market?.name || "Mercado no especificado"}
            </span>
          </div>
        </div>
      )}

      {/* Precio */}
      <div className="text-lg font-bold text-green-600 mb-2">
        {formatPrice(product.price, product.priceType)}
      </div>

      {/* Valoración */}
      {hasRating && (
        <div className="flex items-center justify-center mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`h-4 w-4 ${
                  star <= averageRating ? "text-yellow-400" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-1 text-sm text-gray-600">
            ({Number(averageRating).toFixed(1)})
          </span>
        </div>
      )}

      <div className="text-sm mb-3">
        {isAvailable ? (
          <div className="flex items-center justify-center text-green-600">
            <FaCheckCircle className="mr-1" />
            <span className="font-medium">Disponible</span>
          </div>
        ) : (
          <div className="flex items-center justify-center text-red-600">
            <FaTimesCircle className="mr-1" />
            <span className="font-medium">No Disponible</span>
          </div>
        )}
      </div>

      <button
        onClick={() => router.push(`/productos/mercado/${product.id}`)}
        className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition font-semibold w-full"
      >
        Ver Detalles
      </button>
    </div>
  );
}
