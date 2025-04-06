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

          {/* Modal de Información */}
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
                <div className="fixed inset-0 bg-transparent" />
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
                      {product.nutrition ? (
                        <div className="mt-4">
                          <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                            {product.nutrition}
                          </pre>
                        </div>
                      ) : product.description ? (
                        <div className="mt-4">
                          <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                            {product.description}
                          </pre>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <p className="text-sm text-gray-500">
                            No hay información nutricional disponible para este
                            producto.
                          </p>
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

          {/* Valoraciones */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Valoración de los clientes
            </h2>

            {/* Valoraciones por mercado */}
            <div className="mt-4">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                Valoraciones por mercado
              </h3>

              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4">
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
                      <div
                        key={market.id}
                        className="flex-shrink-0 w-64 bg-white rounded-lg shadow p-4"
                      >
                        <div className="flex items-center mb-2">
                          <MapPinIcon className="h-4 w-4 text-red-500 mr-1" />
                          <h4 className="font-medium text-gray-900 truncate">
                            {market.name}
                          </h4>
                        </div>

                        <div className="flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              className={`${
                                avgRating > rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              } h-4 w-4 flex-shrink-0`}
                            />
                          ))}
                          <p className="ml-2 text-sm text-gray-700">
                            {avgRating.toFixed(1)} de 5
                          </p>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {totalRatings} valoraciones
                        </p>

                        <div className="mt-2">
                          {ratingDistribution.map((count, index) => {
                            const percentage =
                              totalRatings > 0
                                ? (count / totalRatings) * 100
                                : 0;

                            return (
                              <div
                                key={index}
                                className="flex items-center mt-1"
                              >
                                <span className="text-xs text-gray-600 w-8">
                                  {index + 1}
                                </span>
                                <div className="flex-1 h-2 mx-2 bg-gray-100 rounded">
                                  <div
                                    className="h-2 bg-yellow-400 rounded"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600 w-8">
                                  {count}
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
      </div>

      {/* Comentarios */}
      <div className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Comentarios</h2>
          {session ? (
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Escribir comentario
            </button>
          ) : (
            <p className="text-sm text-gray-500">
              Inicia sesión para dejar un comentario
            </p>
          )}
        </div>

        {/* Formulario de comentario */}
        {showCommentForm && (
          <form
            onSubmit={handleCommentSubmit}
            className="mt-6 bg-white rounded-lg shadow-sm p-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mercado donde compraste
                </label>
                <select
                  value={newComment.marketId}
                  onChange={(e) =>
                    setNewComment({ ...newComment, marketId: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Selecciona un mercado</option>
                  {product.markets?.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.name} - {market.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Valoración
                </label>
                <div className="mt-1 flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setNewComment({ ...newComment, rating: star })
                      }
                      className={`${
                        newComment.rating >= star
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } hover:text-yellow-400`}
                    >
                      <StarIcon className="h-5 w-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ¿Recomiendas este producto?
                </label>
                <div className="mt-1">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-green-600"
                      name="recommends"
                      checked={newComment.recommends}
                      onChange={() =>
                        setNewComment({ ...newComment, recommends: true })
                      }
                    />
                    <span className="ml-2">Sí</span>
                  </label>
                  <label className="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      className="form-radio text-red-600"
                      name="recommends"
                      checked={!newComment.recommends}
                      onChange={() =>
                        setNewComment({ ...newComment, recommends: false })
                      }
                    />
                    <span className="ml-2">No</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tu comentario
                </label>
                <textarea
                  value={newComment.content}
                  onChange={(e) =>
                    setNewComment({ ...newComment, content: e.target.value })
                  }
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  placeholder="Comparte tu experiencia con este producto..."
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Publicar comentario
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="mt-6 space-y-6">
          {product.comments.map((comment) => (
            <div key={comment.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {[0, 1, 2, 3, 4].map((rating) => (
                    <StarIcon
                      key={rating}
                      className={`${
                        comment.rating > rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      } h-5 w-5`}
                    />
                  ))}
                  <p className="ml-2 text-sm text-gray-500">
                    {comment.rating} de 5
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    comment.recommends
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {comment.recommends ? "Recomienda" : "No recomienda"}
                </span>
              </div>
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                {comment.user.name || comment.user.username}
              </h3>
              <p className="mt-2 text-gray-600">{comment.content}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleVote(comment.id, "like")}
                    className={`flex items-center space-x-1 ${
                      session ? "hover:text-green-600" : "cursor-not-allowed"
                    }`}
                    disabled={!session}
                  >
                    <ThumbUpIcon className="h-5 w-5" />
                    <span>{comment.likes}</span>
                  </button>
                  <button
                    onClick={() => handleVote(comment.id, "dislike")}
                    className={`flex items-center space-x-1 ${
                      session ? "hover:text-red-600" : "cursor-not-allowed"
                    }`}
                    disabled={!session}
                  >
                    <ThumbDownIcon className="h-5 w-5" />
                    <span>{comment.dislikes}</span>
                  </button>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span>{comment.market.name}</span>
                  <span className="mx-2">•</span>
                  <time dateTime={comment.createdAt}>
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </time>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
