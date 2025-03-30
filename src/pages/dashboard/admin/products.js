import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function AdminProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session]);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este producto?")) return;

    const res = await fetch(`/api/admin/products/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Error al eliminar producto");
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-900">🛒 Gestión de Productos</h1>
        <button
          onClick={() => router.push("/dashboard/admin/products/create")}
          className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
        >
          + Crear producto
        </button>
      </div>

      <table className="w-full bg-white border shadow-sm rounded">
        <thead className="bg-green-100 text-left text-green-900">
          <tr>
            <th className="p-3">Nombre</th>
            <th className="p-3">Mercado</th>
            <th className="p-3">Categoría</th>
            <th className="p-3">Disponibilidad</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{p.name}</td>
              <td className="p-3">{p.market?.name || "Sin asignar"}</td>
              <td className="p-3">{p.category}</td>
              <td className="p-3">{p.isAvailable ? "Sí" : "No"}</td>
              <td className="p-3 space-x-3">
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() =>
                    router.push(`/dashboard/admin/products/edit/${p.id}`)
                  }
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
