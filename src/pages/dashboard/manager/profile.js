import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaEdit,
  FaSave,
  FaTimes,
  FaUpload,
  FaImage,
} from "react-icons/fa";
import PasswordInput from "@/components/PasswordInput";
import BackButton from "@/components/BackButton";

export default function ManagerProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    name: "",
    username: "",
    image: "",
  });
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
    if (!session || session.user.role !== "MARKET_MANAGER") {
      router.push("/dashboard");
      return;
    }

    // Cargar perfil del usuario
    fetch("/api/user/profile")
      .then((res) => res.json())
      .then((data) => {
        const currentImage = data.user?.image || session.user?.image || "";
        setUserProfile(data.user);
        setProfileForm({
          name: data.user.name || "",
          username: data.user.username,
          password: "",
          image: currentImage,
        });
        setImagePreview(currentImage);
      })
      .catch((error) => {
        console.error("Error al cargar perfil:", error);
      });
  }, [session, status, router]);

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
      const newImageUrl = data.url;
      setProfileForm({
        ...profileForm,
        image: newImageUrl,
      });
      setImagePreview(newImageUrl);
    } catch (err) {
      console.error(err);
      setError("Error al subir la imagen: " + err.message);
      setImagePreview(userProfile.image || session.user?.image || "");
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

      // Redirigir al dashboard después de 1 segundo
      setTimeout(() => {
        router.push("/dashboard/manager");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Error al actualizar el perfil");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <BackButton />
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Editar Perfil
          </h1>

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

          <form onSubmit={handleProfileSubmit} className="space-y-6">
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
                onClick={() => router.push("/dashboard/manager")}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <FaTimes className="mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
