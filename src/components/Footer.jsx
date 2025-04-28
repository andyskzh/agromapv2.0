import { useRouter } from "next/router";
import Image from "next/image";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  const router = useRouter();

  return (
    <footer className="bg-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-2">
              <img
                src="/logo.png"
                alt="AgroMap Logo"
                className="h-8 w-8 mr-2"
              />
              <span className="text-xl font-bold">AgroMap</span>
            </div>
            <p className="text-green-100 text-sm mb-2">
              Conectando a los consumidores con los productos agrícolas más
              frescos y saludables. Descubra la disponibilidad de alimentos en
              mercados cercanos, explore sus beneficios nutricionales y
              planifique su compra desde la comodidad de su hogar.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-base font-semibold mb-2">Enlaces Rápidos</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => router.push("/")}
                  className="text-green-100 hover:text-white transition-colors text-sm"
                >
                  Inicio
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/categorias/todos")}
                  className="text-green-100 hover:text-white transition-colors text-sm"
                >
                  Categorías
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/establecimientos")}
                  className="text-green-100 hover:text-white transition-colors text-sm"
                >
                  Establecimientos
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/sobre-nosotros")}
                  className="text-green-100 hover:text-white transition-colors text-sm"
                >
                  Sobre Nosotros
                </button>
              </li>
            </ul>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-base font-semibold mb-2">Contacto</h3>
            <div className="space-y-1">
              <div className="flex items-center">
                <FaEnvelope className="mr-2 text-sm" />
                <a
                  href="mailto:info@agromap.cu"
                  className="text-green-100 hover:text-white transition-colors text-sm"
                >
                  info@agromap.cu
                </a>
              </div>
              <div className="flex items-center">
                <FaPhone className="mr-2 text-sm" />
                <a
                  href="tel:+53712345678"
                  className="text-green-100 hover:text-white transition-colors text-sm"
                >
                  +53 7 123 456 78
                </a>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-sm" />
                <span className="text-green-100 text-sm">
                  Universidad de Ciencias Informáticas, La Habana, Cuba
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Colaboradores */}
        <div className="mt-6">
          <h3 className="text-base font-semibold mb-3 text-center">
            Colaboradores
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-4">
            <a
              href="https://www.minag.gob.cu"
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-16 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image
                src="/images/about/logo-minag.png"
                alt="Logo MINAG"
                fill
                className="object-contain p-1"
              />
            </a>
            <a
              href="https://www.fao.org"
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-16 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image
                src="/images/about/logo-fao.png"
                alt="Logo FAO"
                fill
                className="object-contain p-1"
              />
            </a>
            <a
              href="https://ec.europa.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-16 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image
                src="/images/about/logo-ue.png"
                alt="Logo Unión Europea"
                fill
                className="object-contain p-1"
              />
            </a>
            <a
              href="https://www.uci.cu"
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-16 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image
                src="/images/about/logo-uci.png"
                alt="Logo UCI"
                fill
                className="object-contain p-1"
              />
            </a>
            <a
              href="https://posas.cu"
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-16 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image
                src="/images/about/logo-posas.png"
                alt="Logo POSAS"
                fill
                className="object-contain p-1"
              />
            </a>
            <a
              href="https://www.eicma.cu"
              target="_blank"
              rel="noopener noreferrer"
              className="relative h-16 w-32 bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Image
                src="/images/about/logo-eicma.png"
                alt="Logo EICMA"
                fill
                className="object-contain p-1"
              />
            </a>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-green-500 mt-4 pt-4">
          <p className="text-center text-green-100 text-sm">
            © {new Date().getFullYear()} AgroMap. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
