import { useRouter } from "next/router";
import { useEffect, useState, Fragment } from "react";
import Image from "next/image";
import { StarIcon } from "@heroicons/react/20/solid";
import {
  MapPinIcon,
  HandThumbUpIcon as ThumbUpIcon,
  HandThumbDownIcon as ThumbDownIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";

export default function ProductoDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [currentMarketIndex, setCurrentMarketIndex] = useState(0);
  const [newComment, setNewComment] = useState({
    rating: 5,
    content: "",
    marketId: "",
    recommends: true,
  });

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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("Debes iniciar sesión para comentar");
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newComment,
          productId: id,
        }),
      });

      if (res.ok) {
        // Recargar los comentarios
        const updatedProduct = await fetch(`/api/public/products/${id}`).then(
          (res) => res.json()
        );
        setProduct(updatedProduct);
        setShowCommentForm(false);
        setNewComment({
          rating: 5,
          content: "",
          marketId: "",
          recommends: true,
        });
      } else {
        throw new Error("Error al enviar el comentario");
      }
    } catch (error) {
      alert("Error al enviar el comentario");
    }
  };

  const handleVote = async (commentId, voteType) => {
    if (!session) {
      alert("Debes iniciar sesión para votar");
      return;
    }

    try {
      await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: voteType }),
      });

      // Recargar los comentarios
      const updatedProduct = await fetch(`/api/public/products/${id}`).then(
        (res) => res.json()
      );
      setProduct(updatedProduct);
    } catch (error) {
      alert("Error al votar el comentario");
    }
  };

  // Función para cambiar el mercado actual en el slider
  const handleMarketChange = (index) => {
    setCurrentMarketIndex(index);
  };

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
        {/* Columna izquierda */}
        <div>
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

          {/* Valoraciones */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Valoración de los clientes
            </h2>

            {/* Slider de mercados */}
            <div className="relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentMarketIndex * 100}%)`,
                  }}
                >
                  {product.markets?.map((market) => {
                    // Calcular valoraciones para este mercado
                    const marketComments = product.comments.filter(
                      (comment) => comment.marketId === market.id
                    );

                    const totalRatings = marketComments.length;
                    const avgRating =
                      totalRatings > 0
                        ? marketComments.reduce(
                            (sum, comment) => sum + comment.rating,
                            0
                          ) / totalRatings
                        : 0;

                    // Calcular distribución de estrellas
                    const ratingDistribution = [0, 0, 0, 0, 0];
                    marketComments.forEach((comment) => {
                      if (comment.rating >= 1 && comment.rating <= 5) {
                        ratingDistribution[comment.rating - 1]++;
                      }
                    });

                    return (
                      <div key={market.id} className="w-full flex-shrink-0">
                        {/* Selector de mercado */}
                        <div className="flex items-center mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPinIcon className="h-4 w-4 text-red-500 mr-1" />
                            <span className="font-medium">{market.name}</span>
                            <span className="text-gray-400 ml-2">
                              {market.location}
                            </span>
                          </div>
                        </div>

                        {/* Estrellas y puntuación */}
                        <div className="flex items-center mb-4">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              className={`h-5 w-5 ${
                                avgRating > rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {avgRating.toFixed(1)} de 5 ({totalRatings}{" "}
                            valoraciones)
                          </span>
                        </div>

                        {/* Distribución de estrellas */}
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((stars, index) => {
                            const count = ratingDistribution[5 - stars];
                            const percentage =
                              totalRatings > 0
                                ? (count / totalRatings) * 100
                                : 0;

                            return (
                              <div key={stars} className="flex items-center">
                                <span className="text-sm text-gray-600 w-24">
                                  {stars} estrellas
                                </span>
                                <div className="flex-1 h-2 mx-2 bg-gray-100 rounded">
                                  <div
                                    className="h-2 bg-green-500 rounded"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600 w-12">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {product.markets?.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {product.markets.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleMarketChange(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentMarketIndex === index
                          ? "bg-green-500"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                      aria-label={`Ir a mercado ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCommentForm(true)}
              className="mt-6 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Añadir Reseña
            </button>
          </div>
        </div>

        {/* Columna derecha */}
        <div>
          {/* Información del producto */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Disponibilidad en Mercados */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Disponible en estos mercados:
              </h2>
              <div className="mt-4 space-y-4">
                {product.markets?.map((market) => (
                  <button
                    key={market.id}
                    onClick={() => router.push(`/mercados/${market.id}`)}
                    className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <MapPinIcon className="h-5 w-5 text-red-500 mr-2" />
                      <div>
                        <span className="font-medium text-gray-900">
                          {market.name}
                        </span>
                        <span className="ml-2 text-gray-500">
                          {market.location}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-medium">
                        ${market.price} / {market.priceType}
                      </div>
                      <div className="text-sm text-gray-500">
                        Disponible: {market.quantity} {market.unit}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de Información Nutricional */}
            <div className="mt-6">
              <button
                onClick={() => setShowInfoModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Ver Información Nutricional
              </button>
            </div>

            {/* Comentarios */}
            <div className="mt-8 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Comentarios
              </h2>

              <div className="space-y-6">
                {product.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                          {comment.user.image ? (
                            <Image
                              src={comment.user.image}
                              alt={comment.user.name || comment.user.username}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {comment.user.name?.[0] ||
                                  comment.user.username?.[0] ||
                                  "U"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {comment.user.name || comment.user.username}
                          </h3>
                          <div className="flex items-center">
                            {[0, 1, 2, 3, 4].map((rating) => (
                              <StarIcon
                                key={rating}
                                className={`h-4 w-4 ${
                                  comment.rating > rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-xs text-gray-500">
                              {comment.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          comment.recommends
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {comment.recommends
                          ? "Recomendable"
                          : "No Recomendable"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-2">
                      {comment.content}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 text-red-500 mr-1" />
                        <span>{comment.market.name}</span>
                        <span className="text-gray-400 ml-1">
                          {comment.market.location}
                        </span>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          className={`flex items-center space-x-1 ${
                            session
                              ? "hover:text-green-600"
                              : "cursor-not-allowed"
                          }`}
                          onClick={() => handleVote(comment.id, "like")}
                          disabled={!session}
                        >
                          <ThumbUpIcon className="h-5 w-5" />
                          <span>{comment.likes}</span>
                        </button>
                        <button
                          className={`flex items-center space-x-1 ${
                            session
                              ? "hover:text-red-600"
                              : "cursor-not-allowed"
                          }`}
                          onClick={() => handleVote(comment.id, "dislike")}
                          disabled={!session}
                        >
                          <ThumbDownIcon className="h-5 w-5" />
                          <span>{comment.dislikes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
