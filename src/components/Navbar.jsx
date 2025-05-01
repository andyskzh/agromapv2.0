import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import {
  FaUserCircle,
  FaSearch,
  FaBars,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import debounce from "lodash/debounce";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    products: [],
    markets: [],
  });
  const [showSearchResults, setShowSearchResults] = useState(false);

  const menuRef = useRef(null);
  const mobileRef = useRef(null);
  const searchRef = useRef(null);

  const performSearch = debounce(async (query) => {
    if (!query.trim()) {
      setSearchResults({ products: [], markets: [] });
      return;
    }

    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error performing search:", error);
    }
  }, 300);

  useEffect(() => {
    performSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !mobileRef.current?.contains(event.target) &&
        !searchRef.current?.contains(event.target)
      ) {
        setShowProfileMenu(false);
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      if (searchQuery.trim()) {
        router.push(`/busqueda?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery("");
        setShowSearchResults(false);
        setMobileMenuOpen(false);
      }
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/busqueda?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchResults(false);
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="AgroMap Logo"
            className="h-8 w-8 mr-2 cursor-pointer"
            onClick={() => router.push("/")}
          />
          <span
            className="text-xl font-bold cursor-pointer"
            onClick={() => router.push("/")}
          >
            AgroMap
          </span>
        </div>

        {/* Botón Hamburguesa */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>

        {/* Menú Desktop */}
        <div
          className="hidden md:flex space-x-6 text-sm font-semibold relative"
          ref={menuRef}
        >
          <button
            onClick={() => router.push("/sobre-nosotros")}
            className="hover:text-white/80 cursor-pointer"
          >
            Sobre Nosotros
          </button>

          <button
            onClick={() => router.push("/categorias/todos")}
            className="hover:text-white/80 cursor-pointer"
          >
            Productos
          </button>

          <button
            onClick={() => router.push("/establecimientos")}
            className="hover:text-white/80 cursor-pointer"
          >
            Establecimientos
          </button>

          <button
            onClick={() => router.push("/contacto")}
            className="hover:text-white/80 cursor-pointer"
          >
            Contacto
          </button>
        </div>

        {/* Search + Perfil (Desktop) */}
        <div
          className="hidden md:flex items-center space-x-4 relative"
          ref={menuRef}
        >
          <div className="relative" ref={searchRef}>
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar productos y mercados..."
              className="pl-8 pr-3 py-2 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-64 border border-transparent"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
            />
            {showSearchResults &&
              (searchResults.products.length > 0 ||
                searchResults.markets.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
                  {searchResults.products.length > 0 && (
                    <div className="p-2">
                      <h3 className="text-sm font-semibold text-gray-500 px-2 py-1">
                        Productos
                      </h3>
                      {searchResults.products.map((product) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-green-50 cursor-pointer rounded"
                          onClick={() => {
                            router.push(`/productos/mercado/${product.id}`);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-16 h-16 mr-3 flex-shrink-0">
                              <img
                                src={
                                  product.images?.[0] ||
                                  product.image ||
                                  product.baseProduct?.image ||
                                  "/placeholder-product.jpg"
                                }
                                alt={product.name}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {product.market.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.markets.length > 0 && (
                    <div className="p-2 border-t">
                      <h3 className="text-sm font-semibold text-gray-500 px-2 py-1">
                        Mercados
                      </h3>
                      {searchResults.markets.map((market) => (
                        <div
                          key={market.id}
                          className="p-2 hover:bg-green-50 cursor-pointer rounded"
                          onClick={() => {
                            router.push(`/establecimientos/${market.id}`);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex items-center">
                            {market.image && (
                              <img
                                src={market.image}
                                alt={market.name}
                                className="w-8 h-8 object-cover rounded mr-2"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {market.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {market.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {(searchResults.products.length > 0 ||
                    searchResults.markets.length > 0) && (
                    <div className="p-2 border-t">
                      <div
                        className="p-2 hover:bg-green-50 cursor-pointer rounded text-center text-sm font-medium text-green-600"
                        onClick={() => {
                          router.push(
                            `/busqueda?q=${encodeURIComponent(searchQuery)}`
                          );
                          setShowSearchResults(false);
                          setSearchQuery("");
                        }}
                      >
                        Ver todos los resultados (
                        {searchResults.products.length +
                          searchResults.markets.length}
                        )
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Perfil de usuario */}
          {session?.user ? (
            <div className="relative">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt="perfil"
                  className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-white"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                />
              ) : (
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white text-green-600 cursor-pointer"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  title="Menú de usuario"
                >
                  <FaUserCircle className="text-2xl" />
                </div>
              )}

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-[1000]">
                  <div
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                  >
                    Ir al Dashboard
                  </div>
                  <div
                    onClick={() => signOut()}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                  >
                    Cerrar Sesión
                  </div>
                </div>
              )}
            </div>
          ) : (
            <FaUserCircle
              className="text-white text-3xl cursor-pointer"
              onClick={() => signIn()}
              title="Iniciar sesión"
            />
          )}
        </div>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <>
          {/* Fondo difuminado */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-0 z-50">
            <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-green-600 text-white">
                  <h2 className="text-xl font-bold">Menú</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white hover:text-green-200"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>

                {/* Search bar in mobile menu */}
                <div className="p-4 bg-white">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearch}
                      className="w-full pl-4 pr-10 py-3 border-2 border-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 font-medium"
                    />
                    <button
                      onClick={handleSearchClick}
                      className="absolute right-3 top-4 text-green-600 hover:text-green-700"
                    >
                      <FaSearch className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* User profile in mobile menu */}
                <div className="p-4 bg-white border-t border-gray-200">
                  {session ? (
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-3">
                        {session.user.image ? (
                          <img
                            src={session.user.image}
                            alt="Foto de perfil"
                            className="w-14 h-14 rounded-full object-cover border-2 border-green-600"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center border-2 border-green-600">
                            <FaUser className="text-white text-2xl" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800 text-lg">
                            {session.user.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {session.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            router.push("/dashboard");
                            setMobileMenuOpen(false);
                          }}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                          }}
                          className="flex-1 border-2 border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors font-semibold text-sm"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                          <FaUser className="text-green-600 text-3xl" />
                        </div>
                        <p className="text-gray-800 font-semibold">
                          ¿No tienes una cuenta?
                        </p>
                        <p className="text-sm text-gray-600">
                          Únete a nuestra comunidad
                        </p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            signIn();
                            setMobileMenuOpen(false);
                          }}
                          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          Iniciar Sesión
                        </button>
                        <button
                          onClick={() => {
                            router.push("/auth/signup");
                            setMobileMenuOpen(false);
                          }}
                          className="flex-1 border-2 border-green-600 text-green-600 py-3 px-4 rounded-lg hover:bg-green-50 transition-colors font-semibold"
                        >
                          Registrarse
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation links */}
                <div className="flex-1 overflow-y-auto bg-white">
                  <div className="p-4 space-y-2">
                    <button
                      onClick={() => {
                        router.push("/sobre-nosotros");
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-3 px-4 text-gray-800 hover:bg-green-50 hover:text-green-600 transition-colors font-semibold rounded-lg"
                    >
                      Sobre Nosotros
                    </button>

                    <button
                      onClick={() => {
                        router.push("/categorias/todos");
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-3 px-4 text-gray-800 hover:bg-green-50 hover:text-green-600 transition-colors font-semibold rounded-lg"
                    >
                      Productos
                    </button>

                    <button
                      onClick={() => {
                        router.push("/establecimientos");
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-3 px-4 text-gray-800 hover:bg-green-50 hover:text-green-600 transition-colors font-semibold rounded-lg"
                    >
                      Establecimientos
                    </button>

                    <button
                      onClick={() => {
                        router.push("/contacto");
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left py-3 px-4 text-gray-800 hover:bg-green-50 hover:text-green-600 transition-colors font-semibold rounded-lg"
                    >
                      Contacto
                    </button>
                  </div>
                </div>

                {/* Footer section */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center font-medium">
                    © 2024 AgroMap. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
