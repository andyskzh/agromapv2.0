import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PasswordInput from "@/components/PasswordInput";

export default function EditUserAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "USER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setFormData({
          name: data.user.name || "",
          username: data.user.username,
          password: "", // No mostramos la contraseña actual
          role: data.user.role,
        });
      } else {
        setError(data.message || "Error al cargar el usuario");
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      // Solo enviamos la contraseña si se ha cambiado
      const dataToSend = {
        name: formData.name,
        username: formData.username,
        role: formData.role,
      };

      if (formData.password) {
        dataToSend.password = formData.password;
      }

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al actualizar el usuario");
        return;
      }

      setSuccess(true);
      // Limpiamos la contraseña después de guardar
      setFormData({ ...formData, password: "" });

      // Redirigimos después de un breve retraso
      setTimeout(() => {
        router.push("/dashboard/admin/users");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Error al procesar la solicitud");
    }
  };

  if (loading) return <p className="p-6">Cargando...</p>;
  if (!user) return <p className="p-6">Usuario no encontrado</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        Editar Usuario: {user.username}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
          Usuario actualizado correctamente. Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Nombre de usuario *
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <PasswordInput
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          label="Contraseña (dejar en blanco para mantener la actual)"
          required={false}
        />

        <div>
          <label className="block font-semibold text-green-900 mb-1">
            Rol *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="USER">Usuario</option>
            <option value="MARKET_MANAGER">Gestor de Mercado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/admin/users")}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
