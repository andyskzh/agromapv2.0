import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ProductCard from "@/components/ProductCard";
import MarketProductCard from "@/components/MarketProductCard";
import {
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";

export default function AllProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMarkets, setLoadingMarkets] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    market: "TODOS",
    rating: "TODOS",
    availability: "TODOS",
    priceMin: "",
    priceMax: "",
    sortBy: "NONE",
    category: "TODOS",
  });
  const [markets, setMarkets] = useState([]);

  const categories = [
    { key: "TODOS", label: "Todas las categorías" },
    { key: "HORTALIZA", label: "Hortalizas" },
    { key: "FRUTA", label: "Frutas" },
    { key: "VIANDA_TUBERCULO", label: "Viandas y Tubérculos" },
    { key: "GRANO_CEREAL", label: "Granos y Cereales" },
    { key: "CARNE_EMBUTIDO", label: "Carnes y Embutidos" },
    { key: "LACTEO_DERIVADO", label: "Lácteos y Derivados" },
    {
      key: "HUEVO_PRODUCTO_ANIMAL",
      label: "Huevos y Otros Productos Animales",
    },
    {
      key: "HIERBA_ESPECIA_CONDIMENTO",
      label: "Hierbas, Especias y Condimentos",
    },
    {
      key: "PROCESADO_CONSERVA_ARTESANAL",
      label: "Procesados y Conservas Artesanales",
    },
    { key: "OTRO", label: "Otros" },
  ];

  useEffect(() => {
    fetchProducts();
    fetchMarkets();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) {
        setProducts(data.products);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarkets = async () => {
    try {
      setLoadingMarkets(true);
      const res = await fetch("/api/markets");
      const data = await res.json();
      if (res.ok) {
        setMarkets(data || []);
      }
    } catch (err) {
      console.error("Error al cargar mercados:", err);
      setMarkets([]);
    } finally {
      setLoadingMarkets(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesMarket =
      filters.market === "TODOS" ||
      (product.market && product.market.id.toString() === filters.market);
    const matchesRating =
      filters.rating === "TODOS" || product.rating >= parseInt(filters.rating);
    const matchesAvailability =
      filters.availability === "TODOS" ||
      (filters.availability === "DISPONIBLE" && product.isAvailable) ||
      (filters.availability === "NO_DISPONIBLE" && !product.isAvailable);
    const matchesPriceRange =
      (!filters.priceMin || product.price >= parseFloat(filters.priceMin)) &&
      (!filters.priceMax || product.price <= parseFloat(filters.priceMax));
    const matchesCategory =
      filters.category === "TODOS" || product.category === filters.category;

    return (
      matchesMarket &&
      matchesRating &&
      matchesAvailability &&
      matchesPriceRange &&
      matchesCategory
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case "RATING_DESC":
        return (b.rating || 0) - (a.rating || 0);
      case "RATING_ASC":
        return (a.rating || 0) - (b.rating || 0);
      case "PRICE_DESC":
        return b.price - a.price;
      case "PRICE_ASC":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Todos los Productos
      </h1>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Filtro por Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
            >
              {categories.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Mercado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mercado
            </label>
            <select
              value={filters.market}
              onChange={(e) =>
                setFilters({ ...filters, market: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
              disabled={loadingMarkets}
            >
              <option value="TODOS">
                {loadingMarkets ? "Cargando mercados..." : "Todos los mercados"}
              </option>
              {!loadingMarkets &&
                markets &&
                markets.length > 0 &&
                markets.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Filtro por Valoración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valoración mínima
            </label>
            <select
              value={filters.rating}
              onChange={(e) =>
                setFilters({ ...filters, rating: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
            >
              <option value="TODOS">Todas las valoraciones</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 estrellas)</option>
              <option value="4">⭐⭐⭐⭐ (4 estrellas o más)</option>
              <option value="3">⭐⭐⭐ (3 estrellas o más)</option>
              <option value="2">⭐⭐ (2 estrellas o más)</option>
              <option value="1">⭐ (1 estrella o más)</option>
            </select>
          </div>

          {/* Filtro por Disponibilidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Disponibilidad
            </label>
            <select
              value={filters.availability}
              onChange={(e) =>
                setFilters({ ...filters, availability: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
            >
              <option value="TODOS">Todos</option>
              <option value="DISPONIBLE">Disponibles</option>
              <option value="NO_DISPONIBLE">No disponibles</option>
            </select>
          </div>

          {/* Filtro por Rango de Precio */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Rango de Precio
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Mín"
                value={filters.priceMin}
                onChange={(e) =>
                  setFilters({ ...filters, priceMin: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
                min="0"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Máx"
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters({ ...filters, priceMax: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
                min="0"
              />
            </div>
          </div>

          {/* Ordenar por */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                setFilters({ ...filters, sortBy: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-gray-800"
            >
              <option value="NONE">Sin ordenar</option>
              <option value="RATING_DESC">Mejor valorados</option>
              <option value="PRICE_ASC">Precio: menor a mayor</option>
              <option value="PRICE_DESC">Precio: mayor a menor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Productos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : sortedProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          No se encontraron productos
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <MarketProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
