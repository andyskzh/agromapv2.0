import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session || session.user.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } else {
      alert("Error al eliminar el usuario");
    }
  };

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-900 mb-4">👥 Gestión de Usuarios</h1>

      {loading ? (
        <p className="text-gray-600">Cargando usuarios...</p>
      ) : (
        <table className="w-full bg-white border shadow-sm rounded">
          <thead className="bg-green-100 text-green-900 text-left">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Usuario</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.username}</td>
                <td className="p-3 font-medium">{u.role}</td>
                <td className="p-3">
                  {u.id !== session.user.id && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
