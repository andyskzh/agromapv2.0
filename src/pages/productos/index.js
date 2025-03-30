import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function ProductosPage() {
  const [products, setProducts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/public/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        Productos Disponibles
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded shadow text-center"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-contain mb-4"
            />
            <h2 className="text-lg font-semibold">{product.name}</h2>

            <div className="my-2">
              {product.isAvailable ? (
                <span className="text-green-600 font-medium">Disponible</span>
              ) : (
                <span className="text-gray-400 line-through">
                  No Disponible
                </span>
              )}
            </div>

            <button
              onClick={() => router.push(`/productos/${product.id}`)}
              className="mt-2 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
            >
              Ver Información
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
