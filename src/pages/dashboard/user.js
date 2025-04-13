import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaShoppingBag,
  FaComment,
  FaHistory,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaUpload,
  FaImage,
} from "react-icons/fa";
import PasswordInput from "@/components/PasswordInput";

export default function UserDashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userStats, setUserStats] = useState({
    totalComments: 0,
    totalMarkets: 0,
    recentActivity: [],
  });
  const [userProfile, setUserProfile] = useState({
    name: "",
    username: "",
    image: "",
  });
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    password: "",
    image: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Cargar estadísticas del usuario
    fetch("/api/user/stats")
      .then((res) => res.json())
      .then((data) => {
        setUserStats(data);
      })
      .catch((error) => {
        console.error("Error al cargar estadísticas:", error);
      });

    // Cargar perfil del usuario
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        setUserProfile(data.user);
        setProfileForm({
          name: data.user.name || "",
          username: data.user.username,
          password: "",
          image: data.user.image || "",
        });
        setImagePreview(data.user.image || "");
      })
      .catch((error) => {
        console.error("Error al cargar perfil:", error);
      });

    // Cargar comentarios del usuario
    fetch("/api/user/comments")
      .then((res) => res.json())
      .then((data) => {
        setUserComments(data.comments);
      })
      .catch((error) => {
        console.error("Error al cargar comentarios:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session, status, router]);

  const handleProfileEdit = () => {
    setEditingProfile(true);
  };

  const handleProfileCancel = () => {
    setEditingProfile(false);
    setProfileForm({
      name: userProfile.name || "",
      username: userProfile.username,
      password: "",
      image: userProfile.image || "",
    });
    setImagePreview(userProfile.image || "");
    setError("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar el tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona un archivo de imagen válido");
      return;
    }

    // Verificar el tamaño del archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB");
      return;
    }

    // Crear una vista previa de la imagen
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Subir la imagen al servidor
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al subir la imagen");
      }

      // Actualizar el formulario con la URL de la imagen
      setProfileForm({
        ...profileForm,
        image: data.url,
      });
    } catch (err) {
      console.error(err);
      setError("Error al subir la imagen: " + err.message);
      setImagePreview(userProfile.image || "");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al actualizar el perfil");
        return;
      }

      setUserProfile(data.user);
      setEditingProfile(false);

      // Actualizar la sesión para reflejar los cambios en la navbar
      await update({
        ...session,
        user: {
          ...session.user,
          name: data.user.name,
          username: data.user.username,
          image: data.user.image,
        },
      });

      setSuccess("Perfil actualizado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Error al actualizar el perfil");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este comentario?"))
      return;

    try {
      const res = await fetch("/api/user/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al eliminar el comentario");
        return;
      }

      // Actualizar la lista de comentarios
      setUserComments((prev) => prev.filter((c) => c.id !== commentId));
      setUserStats((prev) => ({
        ...prev,
        totalComments: prev.totalComments - 1,
        recentActivity: prev.recentActivity.filter(
          (a) => !(a.type === "comment" && a.commentId === commentId)
        ),
      }));

      setSuccess("Comentario eliminado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Error al eliminar el comentario");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensajes de error y éxito */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-lg">
            {success}
          </div>
        )}

        {/* Encabezado del perfil */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {userProfile.image ? (
                <img
                  src={userProfile.image}
                  alt="Foto de perfil"
                  className="w-20 h-20 rounded-full object-cover border-4 border-green-500"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <FaUser className="w-10 h-10 text-green-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userProfile.name || "Usuario"}
                </h1>
                <p className="text-gray-600">@{userProfile.username}</p>
                <p className="text-sm text-gray-500">
                  Miembro desde{" "}
                  {new Date(session.user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleProfileEdit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <FaEdit className="mr-2" />
              Editar Perfil
            </button>
          </div>
        </div>

        {/* Formulario de edición de perfil */}
        {editingProfile && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Editar Perfil
            </h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-green-900 mb-1">
                  Nombre completo:
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded p-2 text-gray-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-green-900 mb-1">
                  Nombre de usuario:
                </label>
                <input
                  type="text"
                  value={profileForm.username}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, username: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded p-2 text-gray-800"
                />
              </div>

              <PasswordInput
                value={profileForm.password}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, password: e.target.value })
                }
                label="Contraseña (dejar en blanco para mantener la actual)"
                required={false}
              />

              <div>
                <label className="block font-semibold text-green-900 mb-1">
                  Imagen de perfil
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Vista previa"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaImage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <label className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center cursor-pointer">
                        <FaUpload className="mr-2" />
                        Subir imagen
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {uploadingImage && (
                        <span className="text-sm text-gray-500">
                          Subiendo imagen...
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos: JPG, PNG, GIF. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-green-900 mb-1">
                  URL de imagen de perfil:
                </label>
                <input
                  type="text"
                  value={profileForm.image}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, image: e.target.value });
                    setImagePreview(e.target.value);
                  }}
                  className="w-full border border-gray-300 rounded p-2 text-gray-800"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  <FaSave className="mr-2" />
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={handleProfileCancel}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <FaTimes className="mr-2" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comentarios</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.totalComments}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FaComment className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Mercados visitados
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.totalMarkets}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FaShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Actividad reciente
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {userStats.recentActivity.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FaHistory className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Mis comentarios */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Mis Comentarios
          </h2>
          <div className="space-y-4">
            {userComments.length > 0 ? (
              userComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className="font-medium text-gray-900">
                        {comment.product.name}
                      </span>
                      <span className="mx-2 text-gray-400">•</span>
                      <span className="text-sm text-gray-600">
                        {comment.market.name}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${
                              i < comment.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="ml-4 text-red-600 hover:text-red-800"
                    title="Eliminar comentario"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No has realizado ningún comentario
              </p>
            )}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            {userStats.recentActivity.length > 0 ? (
              userStats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {activity.type === "comment" ? (
                      <FaComment className="w-5 h-5 text-green-600" />
                    ) : (
                      <FaShoppingBag className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No hay actividad reciente
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
