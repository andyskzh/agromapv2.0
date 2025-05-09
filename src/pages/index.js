import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CATEGORIAS = {
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

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slides, setSlides] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
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

        setProducts(data.products);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Procesar productos por categoría
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  // Preparar categorías para mostrar
  const categoriesToShow = Object.keys(CATEGORIAS).slice(
    0,
    showAllCategories ? undefined : 5
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <Hero />

      {/* PRODUCTOS */}
      <section className="py-10 px-6 max-w-7xl mx-auto bg-gray-50">
        <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">
          Productos Disponibles
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          <>
            {categoriesToShow.map((catKey) => {
              const productos = productsByCategory[catKey] || [];
              const currentSlideIndex = slides[catKey] || 0;
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
            })}

            {/* Botón Ver más/Ver menos */}
            {Object.keys(CATEGORIAS).length > 5 && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                >
                  {showAllCategories ? "Ver menos" : "Ver más"}
                </button>
              </div>
            )}
          </>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => router.push("/categorias/todos")}
            className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            Ver Todos los Productos
          </button>
        </div>
      </section>
    </div>
  );
}
