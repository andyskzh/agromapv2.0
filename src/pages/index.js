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
        Object.keys(CATEGORIAS).forEach(cat => {
          agrupados[cat] = [];
        });

        data.products.forEach((producto) => {
          if (producto.category && agrupados[producto.category] !== undefined) {
            agrupados[producto.category].push(producto);
          } else {
            agrupados.OTRO.push(producto);
          }
        });

        setProductosPorCategoria(agrupados);
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
          Productos
        </h2>

        {Object.keys(CATEGORIAS).map((catKey) => {
          const productos = productosPorCategoria[catKey] || [];
          if (productos.length === 0) return null;

          return (
            <div
              key={catKey}
              className="mb-12 bg-green-100 p-6 rounded-lg shadow"
            >
              {/* Encabezado de categoría */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-700">
                  {CATEGORIAS[catKey]}
                </h3>
                <button className="text-green-900 text-sm hover:underline">
                  Ver Otros
                </button>
              </div>

              {/* Lista de productos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {productos.slice(0, 3).map((producto) => (
                  <ProductCard key={producto.id} product={producto} />
                ))}
              </div>
            </div>
          );
        })}

        <div className="text-center mt-10">
          <button className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700">
            Ver más ⌄
          </button>
        </div>
      </section>
    </>
  );
}
