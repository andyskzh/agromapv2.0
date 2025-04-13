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
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [currentMarketIndex, setCurrentMarketIndex] = useState(0);
  const [commentFilter, setCommentFilter] = useState("recent");
  const [marketFilter, setMarketFilter] = useState("");
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
      const res = await fetch(`/api/comments/${commentId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: voteType }),
      });

      if (res.ok) {
        // Recargar los comentarios
        const updatedProduct = await fetch(`/api/public/products/${id}`).then(
          (res) => res.json()
        );
        setProduct(updatedProduct);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Error al votar el comentario");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("Debes iniciar sesión para valorar");
      return;
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: id,
          marketId: newComment.marketId,
          rating: newComment.rating,
        }),
      });

      if (res.ok) {
        // Recargar los comentarios
        const updatedProduct = await fetch(`/api/public/products/${id}`).then(
          (res) => res.json()
        );
        setProduct(updatedProduct);
        setShowRatingForm(false);
        setNewComment({
          rating: 5,
          content: "",
          marketId: "",
        });
      } else {
        throw new Error("Error al enviar la valoración");
      }
    } catch (error) {
      alert("Error al enviar la valoración");
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
        {/* Columna izquierda - Solo visible en desktop */}
        <div className="hidden md:block">
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

          {/* Valoraciones en desktop */}
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Valoración de los clientes
            </h2>

            {/* Slider de mercados */}
            <div className="relative">
              {/* Botón anterior */}
              {currentMarketIndex > 0 && (
                <button
                  onClick={() => handleMarketChange(currentMarketIndex - 1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg z-10"
                  aria-label="Mercado anterior"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {/* Botón siguiente */}
              {currentMarketIndex < product.markets?.length - 1 && (
                <button
                  onClick={() => handleMarketChange(currentMarketIndex + 1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg z-10"
                  aria-label="Siguiente mercado"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

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
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = ratingDistribution[stars - 1];
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
            </div>
          </div>
        </div>

        {/* Columna derecha / Contenido principal en móvil */}
        <div className="flex flex-col">
          {/* Imagen del producto - Solo visible en móvil */}
          <div className="md:hidden relative h-72 bg-white rounded-lg overflow-hidden mb-6">
            <Image
              src={product.image || "/placeholder-product.jpg"}
              alt={product.name}
              layout="fill"
              objectFit="contain"
              className="p-4"
            />
          </div>

          {/* Información del producto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Disponibilidad en Mercados */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Disponible en estos mercados:
              </h2>
              <div className="mt-4 space-y-4">
                {product.markets?.map((market) => (
                  <button
                    key={market.id}
                    onClick={() => {
                      if (!market.productId) {
                        console.error(
                          "No se encontró el ID del producto para el mercado:",
                          market
                        );
                        return;
                      }
                      router.push(`/productos/mercado/${market.productId}`);
                    }}
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
          </div>

          {/* Valoraciones en móvil */}
          <div className="md:hidden mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Valoración de los clientes
            </h2>

            {/* Slider de mercados */}
            <div className="relative">
              {/* Botón anterior */}
              {currentMarketIndex > 0 && (
                <button
                  onClick={() => handleMarketChange(currentMarketIndex - 1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg z-10"
                  aria-label="Mercado anterior"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {/* Botón siguiente */}
              {currentMarketIndex < product.markets?.length - 1 && (
                <button
                  onClick={() => handleMarketChange(currentMarketIndex + 1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white rounded-full p-2 shadow-md hover:shadow-lg z-10"
                  aria-label="Siguiente mercado"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

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
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = ratingDistribution[stars - 1];
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
            </div>
          </div>

          {/* Comentarios */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Comentarios
              </h2>
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Valorar producto
                </button>
                <button
                  onClick={() => setShowCommentForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Escribir comentario
                </button>
              </div>
            </div>

            {/* Filtros de comentarios */}
            <div className="flex flex-wrap gap-2 mb-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                value={commentFilter}
                onChange={(e) => setCommentFilter(e.target.value)}
              >
                <option value="recent" className="text-gray-800">
                  Más recientes
                </option>
                <option value="liked" className="text-gray-800">
                  Más valorados
                </option>
              </select>

              <select
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800"
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
              >
                <option value="" className="text-gray-800">
                  Todos los mercados
                </option>
                {product.markets?.map((market) => (
                  <option
                    key={market.id}
                    value={market.id}
                    className="text-gray-800"
                  >
                    {market.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de comentarios */}
            <div className="space-y-6">
              {product.comments
                .filter((comment) => comment.content.trim() !== "") // Solo mostrar comentarios con contenido
                .filter(
                  (comment) =>
                    !marketFilter || comment.marketId === marketFilter
                ) // Filtrar por mercado
                .sort((a, b) => {
                  if (commentFilter === "recent") {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                  } else {
                    // Ordenar por likes (más likes primero)
                    return b.likes - b.dislikes - (a.likes - a.dislikes);
                  }
                })
                .map((comment) => (
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

      {/* Modal de Información Nutricional */}
      <Transition appear show={showInfoModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowInfoModal(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/10" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Información Nutricional
                  </Dialog.Title>
                  {product.description && (
                    <div className="mt-4">
                      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                        {product.description}
                      </pre>
                    </div>
                  )}
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      onClick={() => setShowInfoModal(false)}
                    >
                      Cerrar
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de valoración */}
      <Transition appear show={showRatingForm} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowRatingForm(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/10" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Valorar producto
                  </Dialog.Title>
                  <form onSubmit={handleRatingSubmit} className="mt-4">
                    <div className="space-y-4">
                      {/* Selector de mercado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Mercado
                        </label>
                        <select
                          value={newComment.marketId}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              marketId: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
                          required
                        >
                          <option value="" className="text-gray-800">
                            Selecciona un mercado
                          </option>
                          {product.markets?.map((market) => (
                            <option
                              key={market.id}
                              value={market.id}
                              className="text-gray-800"
                            >
                              {market.name} - {market.location}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Valoración */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Valoración
                        </label>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setNewComment({ ...newComment, rating: star })
                              }
                              className="p-1"
                            >
                              <StarIcon
                                className={`h-6 w-6 ${
                                  newComment.rating >= star
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowRatingForm(false)}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      >
                        Enviar valoración
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal de comentario */}
      <Transition appear show={showCommentForm} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setShowCommentForm(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/10" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Escribir comentario
                  </Dialog.Title>
                  <form onSubmit={handleCommentSubmit} className="mt-4">
                    <div className="space-y-4">
                      {/* Selector de mercado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Mercado
                        </label>
                        <select
                          value={newComment.marketId}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              marketId: e.target.value,
                            })
                          }
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
                          required
                        >
                          <option value="" className="text-gray-800">
                            Selecciona un mercado
                          </option>
                          {product.markets?.map((market) => (
                            <option
                              key={market.id}
                              value={market.id}
                              className="text-gray-800"
                            >
                              {market.name} - {market.location}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Valoración */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Valoración
                        </label>
                        <div className="flex items-center mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setNewComment({ ...newComment, rating: star })
                              }
                              className="p-1"
                            >
                              <StarIcon
                                className={`h-6 w-6 ${
                                  newComment.rating >= star
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comentario */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          Tu comentario
                        </label>
                        <textarea
                          value={newComment.content}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              content: e.target.value,
                            })
                          }
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
                          required
                        />
                      </div>

                      {/* Recomendación */}
                      <div>
                        <label className="block text-sm font-medium text-gray-800 mb-1">
                          ¿Recomiendas este producto?
                        </label>
                        <div className="mt-1 flex items-center space-x-4">
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={newComment.recommends}
                              onChange={() =>
                                setNewComment({
                                  ...newComment,
                                  recommends: true,
                                })
                              }
                              className="form-radio text-green-600"
                            />
                            <span className="ml-2 text-gray-800">Sí</span>
                          </label>
                          <label className="inline-flex items-center">
                            <input
                              type="radio"
                              checked={!newComment.recommends}
                              onChange={() =>
                                setNewComment({
                                  ...newComment,
                                  recommends: false,
                                })
                              }
                              className="form-radio text-red-600"
                            />
                            <span className="ml-2 text-gray-800">No</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowCommentForm(false)}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      >
                        Publicar comentario
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
