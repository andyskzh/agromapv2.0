import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ProductDetail() {
  const { query } = useRouter();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (query.id) {
      fetch(`/api/public/products/${query.id}`)
        .then((res) => res.json())
        .then((data) => setProduct(data.product))
        .catch((err) => console.error(err));
    }
  }, [query.id]);

  if (!product) return <p className="p-6">Cargando producto...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div className="text-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-80 object-contain"
        />
      </div>

      <div>
        <h1 className="text-3xl font-bold text-green-800 mb-4">
          {product.name}
        </h1>

        <p className="text-sm text-gray-500 mb-2">
          <strong>Disponibilidad:</strong>{" "}
          {product.isAvailable ? (
            <span className="text-green-600 font-semibold">Disponible</span>
          ) : (
            <span className="text-gray-400 line-through">No disponible</span>
          )}
        </p>

        {product.markets?.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Disponible en:
            </p>
            <ul className="pl-4 list-disc">
              {product.markets.map((market) => (
                <li key={market.id} className="text-sm text-gray-700">
                  {market.name}{" "}
                  <span className="text-gray-400">{market.location}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {product.sasProgram && (
          <p className="text-sm text-green-700 mb-4">
            ✅ Potenciado por el programa SAS-Cuba
          </p>
        )}

        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700">
          Información Nutricional
        </button>
      </div>
    </div>
  );
}
