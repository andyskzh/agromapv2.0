import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import MarketProductCard from "@/components/MarketProductCard";
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
  const [isOpen, setIsOpen] = useState(false);

  const CATEGORIES = [
    "TODOS",
    "HORTALIZA",
    "FRUTA",
    "VIANDA_TUBERCULO",
    "GRANO_CEREAL",
    "CARNE_EMBUTIDO",
    "LACTEO_DERIVADO",
    "HUEVO_PRODUCTO_ANIMAL",
    "HIERBA_ESPECIA_CONDIMENTO",
    "PROCESADO_CONSERVA_ARTESANAL",
    "OTRO",
  ];

  const CATEGORY_NAMES = {
    TODOS: "Todas las categorías",
    HORTALIZA: "Hortalizas",
    FRUTA: "Frutas",
    VIANDA_TUBERCULO: "Viandas y Tubérculos",
    GRANO_CEREAL: "Granos y Cereales",
    CARNE_EMBUTIDO: "Carnes y Embutidos",
    LACTEO_DERIVADO: "Lácteos y Derivados",
    HUEVO_PRODUCTO_ANIMAL: "Huevos y Otros Productos Animales",
    HIERBA_ESPECIA_CONDIMENTO: "Hierbas, Especias y Condimentos",
    PROCESADO_CONSERVA_ARTESANAL: "Procesados y Conservas Artesanales",
    OTRO: "Otros",
  };

  console.log("Market recibido:", initialMarket);

  useEffect(() => {
    if (router.query.id) {
      fetchProducts();
    }
  }, [router.query.id]);

  useEffect(() => {
    const checkIfOpen = () => {
      if (!market.schedules || market.schedules.length === 0) {
        setIsOpen(false);
        return;
      }

      const now = new Date();
      const currentDay = ["D", "L", "M", "X", "J", "V", "S"][now.getDay()];
      const currentTime = now.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      // Buscar excepción para el día actual
      const exception = market.schedules.find(
        (s) => s.isException && s.day === currentDay
      );

      if (exception) {
        // Si hay una excepción, usar esos horarios
        setIsOpen(
          currentTime >= exception.openTime &&
            currentTime <= exception.closeTime
        );
        return;
      }

      // Si no hay excepción, buscar el horario regular
      const regularSchedule = market.schedules.find((s) => !s.isException);
      if (regularSchedule && regularSchedule.days.includes(currentDay)) {
        setIsOpen(
          currentTime >= regularSchedule.openTime &&
            currentTime <= regularSchedule.closeTime
        );
        return;
      }

      setIsOpen(false);
    };

    checkIfOpen();
    // Actualizar cada minuto
    const interval = setInterval(checkIfOpen, 60000);
    return () => clearInterval(interval);
  }, [market]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/markets/${router.query.id}/products`);
      const data = await res.json();
      console.log("Productos recibidos:", data);
      if (res.ok) {
        setProducts(data.products);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error("Error al cargar productos:", err);
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

                {market.legalBeneficiary && (
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Beneficiario Legal: {market.legalBeneficiary}</span>
                  </div>
                )}

                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    {market.schedules && market.schedules.length > 0 ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${
                              isOpen ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          <span className="font-medium">
                            {isOpen ? "Abierto" : "Cerrado"}
                          </span>
                        </div>
                        {(() => {
                          const horarios = {};
                          market.schedules.forEach((schedule) => {
                            const key = `${schedule.openTime}-${schedule.closeTime}`;
                            if (!horarios[key]) {
                              horarios[key] = {
                                days: [],
                                openTime: schedule.openTime,
                                closeTime: schedule.closeTime,
                              };
                            }
                            if (schedule.isException) {
                              horarios[key].days.push(schedule.day);
                            } else {
                              horarios[key].days.push(...schedule.days);
                            }
                          });

                          return Object.values(horarios).map(
                            (horario, index) => (
                              <div key={index} className="text-gray-600">
                                <span className="font-medium text-gray-700">
                                  {horario.days.join(", ")}:
                                </span>{" "}
                                {horario.openTime} - {horario.closeTime}
                              </div>
                            )
                          );
                        })()}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Horario no especificado
                      </span>
                    )}
                  </div>
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Productos Disponibles
          </h2>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtros</span>
          </div>
        </div>

        {/* Filtros en una sola línea */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_NAMES[category]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters({ ...filters, searchTerm: e.target.value })
                }
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rango de Precio
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
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
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Disponibilidad
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
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
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
              >
                <option value="NONE">Sin ordenar</option>
                <option value="RATING_DESC">Mejor valorados</option>
                <option value="DATE_DESC">Más recientes</option>
                <option value="PRICE_ASC">Precio: menor a mayor</option>
                <option value="PRICE_DESC">Precio: mayor a menor</option>
              </select>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <MarketProductCard
                  key={product.id}
                  product={product}
                  hideMarket={true}
                />
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
  console.log("ID recibido en getServerSideProps:", params.id);

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
        legalBeneficiary: true,
        schedules: {
          select: {
            id: true,
            marketId: true,
            day: true,
            days: true,
            openTime: true,
            closeTime: true,
            isException: true,
          },
        },
      },
    });

    console.log("Mercado encontrado en getServerSideProps:", market);

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
    console.error("Error en getServerSideProps:", error);
    return {
      props: {
        market: null,
      },
    };
  } finally {
    await prisma.$disconnect();
  }
}
