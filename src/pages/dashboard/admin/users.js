import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdminUsers() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", username: "", password: "", role: "USER" });
  const [showForm, setShowForm] = useState(false);
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
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este usuario?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const handleRoleChange = async (id, role) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      setShowForm(false);
      setNewUser({ name: "", username: "", password: "", role: "USER" });
      fetchUsers();
    }
  };

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-900 mb-4">👥 Gestión de Usuarios</h1>

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 bg-green-700 text-white px-4 py-2 rounded"
      >
        {showForm ? "Cancelar" : "➕ Añadir Usuario"}
      </button>

      {showForm && (
        <form onSubmit={handleAddUser} className="space-y-4 mb-6 bg-white p-4 rounded shadow">
          <div>
            <label className="block text-sm font-semibold">Nombre completo</label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Usuario</label>
            <input
              type="text"
              required
              className="w-full border rounded p-2"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Contraseña</label>
            <input
              type="password"
              required
              className="w-full border rounded p-2"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Rol</label>
            <select
  className="w-full border rounded p-2"
  value={newUser.role}
  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
>
  <option value="USER">USER</option>
  <option value="MARKET_MANAGER">MARKET_MANAGER</option>
  <option value="ADMIN">ADMIN</option>
</select>

          </div>
          <button className="bg-green-600 text-white px-4 py-2 rounded">Crear</button>
        </form>
      )}

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
              <td className="p-3">
              <select
  value={u.role}
  onChange={(e) => handleRoleChange(u.id, e.target.value)}
  className="border rounded px-2 py-1"
>
  <option value="USER">USER</option>
  <option value="MARKET_MANAGER">MARKET_MANAGER</option>
  <option value="ADMIN">ADMIN</option>
</select>

              </td>
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
    </div>
  );
}
