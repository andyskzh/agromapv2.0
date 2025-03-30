import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res.error) {
      setError("Credenciales incorrectas");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-green-800 mb-6">
          Iniciar Sesión
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Nombre de usuario:
            </label>
            <input
              type="text"
              placeholder="Tu usuario"
              className="w-full border border-gray-300 rounded p-2 text-gray-800"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-green-900 mb-1">
              Contraseña:
            </label>
            <input
              type="password"
              placeholder="Tu contraseña"
              className="w-full border border-gray-300 rounded p-2 text-gray-800"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-full font-semibold hover:bg-green-700 transition"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-800">
          ¿No tienes una cuenta?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}
