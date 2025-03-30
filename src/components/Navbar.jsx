import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { FaUserCircle, FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuRef = useRef(null);
  const mobileRef = useRef(null);

  const categorias = [
    { key: "FRUTA", label: "Frutas" },
    { key: "HORTALIZA", label: "Hortalizas" },
    { key: "VIANDA", label: "Viandas" },
    { key: "CARNE_EMBUTIDO", label: "Carnes y Embutidos" },
    { key: "OTRO", label: "Otros" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !menuRef.current?.contains(event.target) &&
        !mobileRef.current?.contains(event.target)
      ) {
        setShowProfileMenu(false);
        setShowCategories(false);
        setMobileMenuOpen(false);
        setShowMobileCategories(false);
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
          <button onClick={() => router.push("/")} className="hover:underline">
            Inicio
          </button>

          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="hover:underline"
            >
              Categorías
            </button>
            {showCategories && (
              <div className="absolute top-8 left-0 bg-white text-black rounded shadow-md w-40 z-10">
                {categorias.map((cat) => (
                  <div
                    key={cat.key}
                    onClick={() =>
                      router.push(`/categorias/${cat.key.toLowerCase()}`)
                    }
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer"
                  >
                    {cat.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push("/establecimientos")}
            className="hover:underline"
          >
            Establecimientos
          </button>

          <button
            onClick={() => router.push("/sobre")}
            className="hover:underline"
          >
            Sobre Nosotros
          </button>
        </div>

        {/* Search + Perfil (Desktop) */}
        <div
          className="hidden md:flex items-center space-x-4 relative"
          ref={menuRef}
        >
          <div className="relative">
            <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar"
              className="pl-8 pr-3 py-1 rounded-full text-sm text-black focus:outline-none border border-green-300 focus:ring-2 focus:ring-white"
            />
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
          className="md:hidden px-4 pb-4 pt-2 bg-green-500 text-sm font-semibold space-y-3"
        >
          <button
            onClick={() => router.push("/")}
            className="block w-full text-left"
          >
            Inicio
          </button>

          <div>
            <button
              onClick={() => setShowMobileCategories(!showMobileCategories)}
              className="block w-full text-left"
            >
              Categorías {showMobileCategories ? "▲" : "▼"}
            </button>

            {showMobileCategories && (
              <div className="pl-4 space-y-1 text-white/90 mt-1">
                {categorias.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowMobileCategories(false);
                      router.push(`/categorias/${cat.key.toLowerCase()}`);
                    }}
                    className="block w-full text-left hover:underline"
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => router.push("/establecimientos")}
            className="block w-full text-left"
          >
            Establecimientos
          </button>

          <button
            onClick={() => router.push("/sobre")}
            className="block w-full text-left"
          >
            Sobre Nosotros
          </button>

          {session?.user ? (
            <>
              <button
                onClick={() => router.push("/dashboard")}
                className="block w-full text-left"
              >
                Ir al Dashboard
              </button>
              <button
                onClick={() => signOut()}
                className="block w-full text-left"
              >
                Cerrar Sesión
              </button>
            </>
          ) : (
            <button onClick={() => signIn()} className="block w-full text-left">
              Iniciar Sesión
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
