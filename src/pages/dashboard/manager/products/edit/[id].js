import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function EditProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;

  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session || session.user.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
    } else if (id) {
      fetchProduct();
    }
  }, [session, status, id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      const data = await res.json();
      if (res.ok) {
        setProduct(data.product);
        setName(data.product.name);
        setQuantity(data.product.quantity);
        setDescription(data.product.description || "");
        setImage(data.product.image || "");
      } else {
        setError("Producto no encontrado");
      }
    } catch (err) {
      console.error(err);
      setError("Error al obtener el producto");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity, description, image }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Error al actualizar el producto");
    } else {
      router.push("/dashboard/manager/products");
    }
  };

  if (!product)
    return <p className="p-6 text-gray-500">Cargando producto...</p>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-green-800 mb-6">
        Editar producto
      </h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Nombre *
          </label>
          <input
            type="text"
            className="w-full border p-2 rounded text-gray-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Cantidad *
          </label>
          <input
            type="number"
            className="w-full border p-2 rounded text-gray-500"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            required
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Descripción
          </label>
          <textarea
            className="w-full border p-2 rounded text-gray-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-semibold mb-1 text-green-800">
            Imagen (URL)
          </label>
          <input
            type="url"
            className="w-full border p-2 rounded text-gray-500"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
