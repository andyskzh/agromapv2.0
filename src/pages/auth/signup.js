import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !username || !password || !confirmPassword) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, username, password, image }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.message || "Error al registrar");
      return;
    }

    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-10">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-6">
          Crear cuenta
        </h2>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Nombre completo*:
            </label>
            <input
              type="text"
              placeholder="Nombre y Apellido"
              className="w-full border border-gray-300 rounded p-2 text-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Nombre de usuario*:
            </label>
            <input
              type="text"
              placeholder="Usuario único"
              className="w-full border border-gray-300 rounded p-2 text-gray-800"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Contraseña*:
            </label>
            <input
              type="password"
              placeholder="Al menos 6 caracteres"
              className="w-full border border-gray-300 rounded p-2 text-gray-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Confirmar contraseña*:
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded p-2"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Foto de perfil (opcional):
            </label>
            <input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              className="w-full border border-gray-300 rounded p-2 text-gray-800"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-full font-semibold hover:bg-green-700 transition"
          >
            Crear Cuenta
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-800">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            Iniciar Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
