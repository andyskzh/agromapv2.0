import { useRouter } from "next/router";

export default function ProductCard({ product }) {
  const router = useRouter();

  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-36 object-contain mb-4"
      />
      <h4 className="text-lg font-bold mb-2 text-gray-700">{product.name}</h4>

      <div className="text-sm mb-3">
        <span
          className={`${
            product.isAvailable
              ? "text-green-600 font-medium"
              : "text-gray-300 line-through"
          }`}
        >
          Disponible
        </span>{" "}
        <span
          className={`${
            !product.isAvailable
              ? "text-red-500 font-medium"
              : "text-gray-300 line-through"
          }`}
        >
          No Disponible
        </span>
      </div>

      <button
        onClick={() => router.push(`/productos/${product.id}`)}
        className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition font-semibold"
      >
        Ver Información
      </button>
    </div>
  );
}
