import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import {
  MapPinIcon,
  FunnelIcon,
  StarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function MarketDetails({ market: initialMarket }) {
  const router = useRouter();
  const [market, setMarket] = useState(initialMarket);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "TODOS",
    searchTerm: "",
    priceRange: "TODOS",
    availability: "TODOS",
    sortBy: "NONE",
  });

  useEffect(() => {
    if (router.query.id) {
      fetchProducts();
    }
  }, [router.query.id]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/markets/${router.query.id}/products`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al cargar los productos del mercado");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      filters.category === "TODOS" || product.category === filters.category;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(filters.searchTerm.toLowerCase());
    const matchesPrice =
      filters.priceRange === "TODOS" ||
      (filters.priceRange === "BAJO" && product.price < 50) ||
      (filters.priceRange === "MEDIO" &&
        product.price >= 50 &&
        product.price < 100) ||
      (filters.priceRange === "ALTO" && product.price >= 100);
    const matchesAvailability =
      filters.availability === "TODOS" ||
      (filters.availability === "DISPONIBLE" && product.isAvailable) ||
      (filters.availability === "NO_DISPONIBLE" && !product.isAvailable);

    return (
      matchesCategory && matchesSearch && matchesPrice && matchesAvailability
    );
  });

  // Ordenar productos según el filtro seleccionado
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "RATING_DESC":
        return (b.rating || 0) - (a.rating || 0);
      case "RATING_ASC":
        return (a.rating || 0) - (b.rating || 0);
      case "DATE_DESC":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "DATE_ASC":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "PRICE_DESC":
        return b.price - a.price;
      case "PRICE_ASC":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!market)
    return <div className="p-8 text-center">Mercado no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Botón de volver atrás */}
        <button
          onClick={() => {
            router.back();
            window.scrollTo(0, 0);
          }}
          className="mb-6 flex items-center text-green-600 hover:text-green-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Volver
        </button>

        {/* Header con imagen e información básica */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            {/* Imagen del mercado */}
            <div className="md:w-1/3 relative h-[300px]">
              {market.image ? (
                <Image
                  src={market.image}
                  alt={market.name}
                  fill
                  priority
                  className="object-cover"
                  quality={100}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Información del mercado */}
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {market.name}
              </h1>

              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>{market.location}</span>
                </div>

                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span>8:00 am a 5:00 pm</span>
                </div>

                {market.description && (
                  <div className="mt-4 text-gray-600">
                    {market.description.split("\n").map((line, i) => (
                      <p key={i} className="mb-2">
                        • {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Título de Productos Disponibles */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Productos Disponibles
        </h2>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold">Filtros</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option value="TODOS">Todas las categorías</option>
                <option value="FRUTA">Frutas</option>
                <option value="HORTALIZA">Hortalizas</option>
                <option value="VIANDA">Viandas</option>
                <option value="CARNE_EMBUTIDO">Carnes y Embutidos</option>
                <option value="OTRO">Otros</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango de Precio
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={filters.priceRange}
                onChange={(e) =>
                  setFilters({ ...filters, priceRange: e.target.value })
                }
              >
                <option value="TODOS">Todos los precios</option>
                <option value="BAJO">Menos de $50</option>
                <option value="MEDIO">$50 - $100</option>
                <option value="ALTO">Más de $100</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disponibilidad
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                value={filters.availability}
                onChange={(e) =>
                  setFilters({ ...filters, availability: e.target.value })
                }
              >
                <option value="TODOS">Todos</option>
                <option value="DISPONIBLE">Disponibles</option>
                <option value="NO_DISPONIBLE">No disponibles</option>
              </select>
            </div>
          </div>

          {/* Filtros de ordenamiento */}
          <div className="border-t pt-4">
            <div className="flex items-center mb-2">
              <StarIcon className="h-5 w-5 text-yellow-400 mr-2" />
              <h3 className="text-md font-medium">Ordenar por</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() =>
                  setFilters({ ...filters, sortBy: "RATING_DESC" })
                }
                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
                  filters.sortBy === "RATING_DESC"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <StarIcon className="h-4 w-4 mr-1" />
                Mejor valorados
              </button>
              <button
                onClick={() => setFilters({ ...filters, sortBy: "DATE_DESC" })}
                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
                  filters.sortBy === "DATE_DESC"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <ClockIcon className="h-4 w-4 mr-1" />
                Más recientes
              </button>
              <button
                onClick={() => setFilters({ ...filters, sortBy: "PRICE_ASC" })}
                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
                  filters.sortBy === "PRICE_ASC"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Precio: Menor a mayor
              </button>
              <button
                onClick={() => setFilters({ ...filters, sortBy: "PRICE_DESC" })}
                className={`flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium ${
                  filters.sortBy === "PRICE_DESC"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Precio: Mayor a menor
              </button>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando productos...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-4 rounded-lg shadow text-center hover:shadow-md transition-shadow"
                >
                  <div className="relative h-36 mb-4">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-gray-700">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
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
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 font-semibold">
                      ${product.price} / {product.priceType}
                    </span>
                    <div className="flex items-center">
                      <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {product.rating || "Sin valoraciones"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/productos/${product.id}`)}
                    className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition font-semibold w-full"
                  >
                    Ver Información
                  </button>
                </div>
              ))}
            </div>

            {sortedProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron productos</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const prisma = new PrismaClient();
  try {
    const market = await prisma.market.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        location: true,
        image: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!market) {
      return {
        notFound: true,
      };
    }

    // Convertir objetos Date a strings para evitar errores de serialización
    const serializedMarket = {
      ...market,
      createdAt: market.createdAt.toISOString(),
      updatedAt: market.updatedAt.toISOString(),
    };

    return {
      props: {
        market: serializedMarket,
      },
    };
  } catch (error) {
    console.error("Error fetching market:", error);
    return {
      props: {
        market: null,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}
