import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIAS = {
  FRUTA: "Frutas",
  HORTALIZA: "Hortalizas",
  VIANDA: "Viandas",
  CARNE_EMBUTIDO: "Carnes y Embutidos",
  OTRO: "Otros",
};

export default function Home() {
  const [productosPorCategoria, setProductosPorCategoria] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState({});
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/public/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Datos recibidos:", data);

        if (!data || !Array.isArray(data.products)) {
          throw new Error("Formato de datos inválido");
        }

        const agrupados = {};
        // Inicializar todas las categorías
        Object.keys(CATEGORIAS).forEach((cat) => {
          agrupados[cat] = new Map(); // Usamos Map para evitar duplicados por ID base
        });

        data.products.forEach((producto) => {
          const categoria = producto.category || "OTRO";
          if (agrupados[categoria]) {
            // Si el producto ya existe en la categoría, actualizamos sus mercados
            if (agrupados[categoria].has(producto.baseProductId)) {
              const productoExistente = agrupados[categoria].get(
                producto.baseProductId
              );
              if (producto.markets) {
                productoExistente.markets = [
                  ...(productoExistente.markets || []),
                  ...producto.markets,
                ];
              }
            } else {
              // Si es un nuevo producto base, lo agregamos
              agrupados[categoria].set(producto.baseProductId, producto);
            }
          }
        });

        // Convertir los Map a arrays para el renderizado
        const productosAgrupados = {};
        Object.keys(agrupados).forEach((cat) => {
          productosAgrupados[cat] = Array.from(agrupados[cat].values());
        });

        setProductosPorCategoria(productosAgrupados);
        // Inicializar el slide actual para cada categoría
        const initialSlides = {};
        Object.keys(CATEGORIAS).forEach((cat) => {
          initialSlides[cat] = 0;
        });
        setCurrentSlide(initialSlides);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

  const handleNextSlide = (category) => {
    setCurrentSlide((prev) => ({
      ...prev,
      [category]: Math.min(
        prev[category] + 1,
        Math.max(0, Math.ceil(productosPorCategoria[category]?.length / 4) - 1)
      ),
    }));
  };

  const handlePrevSlide = (category) => {
    setCurrentSlide((prev) => ({
      ...prev,
      [category]: Math.max(0, prev[category] - 1),
    }));
  };

  return (
    <>
      {/* HERO */}
      <Hero />

      {/* PRODUCTOS */}
      <section className="py-10 px-6 max-w-7xl mx-auto bg-gray-50">
        <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">
          Productos Disponibles
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          Object.keys(CATEGORIAS).map((catKey) => {
            const productos = productosPorCategoria[catKey] || [];
            const currentSlideIndex = currentSlide[catKey] || 0;
            const startIndex = currentSlideIndex * 4;
            const endIndex = startIndex + 4;
            const visibleProducts = productos.slice(startIndex, endIndex);
            const totalSlides = Math.ceil(productos.length / 4);

            return (
              <div
                key={catKey}
                className="mb-12 bg-white p-6 rounded-lg shadow"
              >
                {/* Encabezado de categoría */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-700">
                    {CATEGORIAS[catKey]}
                  </h3>
                  <div className="flex items-center space-x-4">
                    {totalSlides > 1 && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePrevSlide(catKey)}
                          disabled={currentSlideIndex === 0}
                          className={`p-2 rounded-full ${
                            currentSlideIndex === 0
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <FaChevronLeft />
                        </button>
                        <span className="text-sm text-gray-500">
                          {currentSlideIndex + 1} / {totalSlides}
                        </span>
                        <button
                          onClick={() => handleNextSlide(catKey)}
                          disabled={currentSlideIndex === totalSlides - 1}
                          className={`p-2 rounded-full ${
                            currentSlideIndex === totalSlides - 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() =>
                        router.push(`/categorias/${catKey.toLowerCase()}`)
                      }
                      className="text-green-600 text-sm hover:text-green-700 font-medium"
                    >
                      Ver Todos
                    </button>
                  </div>
                </div>

                {/* Lista de productos con animación */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlideIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                  >
                    {visibleProducts.map((producto) => (
                      <ProductCard
                        key={producto.baseProductId}
                        product={producto}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => router.push("/categorias/todos")}
            className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-colors"
          >
            Ver Todos los Productos
          </button>
        </div>
      </section>
    </>
  );
}
