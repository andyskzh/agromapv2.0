import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";
import { MapPinIcon } from "@heroicons/react/24/outline";

export default function ProductoDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarInfoNutricional, setMostrarInfoNutricional] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/public/products/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setProduct(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError("Error al cargar el producto");
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Producto no encontrado</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Imagen del producto */}
        <div className="relative h-96 bg-white rounded-lg overflow-hidden">
          <Image
            src={product.image || "/placeholder-product.jpg"}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="p-4"
          />
        </div>

        {/* Información del producto */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {product.description && (
            <p className="mt-4 text-gray-600">{product.description}</p>
          )}

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Disponible en:
            </h2>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="font-medium">{product.market.name}</span>
                <span className="ml-2 text-gray-500">
                  {product.market.location}
                </span>
              </div>
            </div>
          </div>

          {product.price && (
            <div className="mt-6">
              <p className="text-2xl font-bold text-green-600">
                ${product.price} / {product.priceType}
              </p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => setMostrarInfoNutricional(!mostrarInfoNutricional)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Información Nutricional
              <svg
                className={`ml-2 h-5 w-5 transform ${
                  mostrarInfoNutricional ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>

          {mostrarInfoNutricional && product.nutrition && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-600">
                {product.nutrition}
              </pre>
            </div>
          )}

          {/* Valoraciones */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Valoración de los clientes
            </h2>
            <div className="mt-3">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <StarIcon
                    key={rating}
                    className={`${
                      product.valoraciones.promedio > rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } h-5 w-5 flex-shrink-0`}
                  />
                ))}
                <p className="ml-2 text-sm text-gray-700">
                  {product.valoraciones.promedio} de 5 (
                  {product.valoraciones.total} valoraciones)
                </p>
              </div>

              <div className="mt-6">
                {product.valoraciones.distribucion.map((dist) => (
                  <div key={dist.estrellas} className="flex items-center mt-1">
                    <span className="text-sm text-gray-600 w-12">
                      {dist.estrellas} stars
                    </span>
                    <div className="flex-1 h-4 mx-4 bg-gray-100 rounded">
                      <div
                        className="h-4 bg-yellow-400 rounded"
                        style={{ width: `${dist.porcentaje}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      {dist.porcentaje}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comentarios */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900">Comentarios</h2>
        <div className="mt-6 space-y-6">
          {product.comments.map((comentario) => (
            <div key={comentario.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className={`${
                        comentario.rating > rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } h-5 w-5`}
                    />
                  ))}
                </div>
                <p className="ml-2 text-sm text-gray-500">
                  {comentario.rating} de 5
                </p>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {comentario.user.name || comentario.user.username}
              </h3>
              <p className="mt-2 text-gray-600">{comentario.content}</p>
              <div className="mt-2 text-sm text-gray-500">
                <time dateTime={comentario.createdAt}>
                  {new Date(comentario.createdAt).toLocaleDateString()}
                </time>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
