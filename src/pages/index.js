import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";

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
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error al cargar productos:", error);
        setError(error.message);
        setIsLoading(false);
      });
  }, []);

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
                  <button
                    onClick={() =>
                      router.push(`/categorias/${catKey.toLowerCase()}`)
                    }
                    className="text-green-600 text-sm hover:text-green-700 font-medium"
                  >
                    Ver Todos
                  </button>
                </div>

                {/* Lista de productos */}
                {productos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {productos.slice(0, 4).map((producto) => (
                      <ProductCard
                        key={producto.baseProductId}
                        product={producto}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay productos disponibles en esta categoría.</p>
                    <p className="text-sm mt-2">
                      Los productos aparecerán aquí cuando los mercados los
                      agreguen.
                    </p>
                  </div>
                )}
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
