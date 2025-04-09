import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FaUserCircle, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import debounce from "lodash/debounce";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
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

  const categorias = [
    { key: "todos", label: "Todos los Productos" },
    { key: "fruta", label: "Frutas" },
    { key: "hortaliza", label: "Hortalizas" },
    { key: "vianda", label: "Viandas" },
    { key: "carne_embutido", label: "Carnes y Embutidos" },
    { key: "otro", label: "Otros" },
  ];

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
        setShowCategories(false);
        setMobileMenuOpen(false);
        setShowMobileCategories(false);
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
            onClick={() => router.push("/")}
            className="hover:text-white/80"
          >
            Inicio
          </button>

          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center hover:text-white/80"
            >
              Categorías
              <svg
                className={`ml-1 h-4 w-4 transition-transform ${
                  showCategories ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showCategories && (
              <div className="absolute top-full left-0 mt-1 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden w-48 py-1 z-50">
                {categorias.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      router.push(`/categorias/${cat.key}`);
                      setShowCategories(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-green-50 hover:text-green-600 transition-colors"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push("/establecimientos")}
            className="hover:text-white/80"
          >
            Establecimientos
          </button>

          <button
            onClick={() => router.push("/sobre-nosotros")}
            className="hover:text-white/80"
          >
            Sobre Nosotros
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
              className="pl-8 pr-3 py-1 rounded-full text-sm text-black focus:outline-none border border-green-300 focus:ring-2 focus:ring-white w-64"
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
                            router.push(`/productos/${product.id}`);
                            setShowSearchResults(false);
                            setSearchQuery("");
                          }}
                        >
                          <div className="flex items-center">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-8 h-8 object-cover rounded mr-2"
                              />
                            )}
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
                </div>
              )}
          </div>

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
                <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-md z-10">
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

      {/* Menú Mobile desplegable */}
      {mobileMenuOpen && (
        <div
          ref={mobileRef}
          className="md:hidden px-4 pb-4 pt-2 bg-green-500 text-white text-sm font-semibold space-y-3"
        >
          <button
            onClick={() => {
              router.push("/");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2"
          >
            Inicio
          </button>

          <div>
            <button
              onClick={() => setShowMobileCategories(!showMobileCategories)}
              className="flex items-center justify-between w-full py-2"
            >
              <span>Categorías</span>
              <svg
                className={`h-4 w-4 transition-transform ${
                  showMobileCategories ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showMobileCategories && (
              <div className="pl-4 space-y-2 mt-1">
                {categorias.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      router.push(`/categorias/${cat.key}`);
                      setMobileMenuOpen(false);
                      setShowMobileCategories(false);
                    }}
                    className="block w-full text-left py-2 hover:text-white/80"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              router.push("/establecimientos");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2"
          >
            Establecimientos
          </button>

          <button
            onClick={() => {
              router.push("/sobre-nosotros");
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2"
          >
            Sobre Nosotros
          </button>
        </div>
      )}
    </nav>
  );
}
