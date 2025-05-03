import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Desactivar el parser de body predeterminado de Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Verificar autenticación
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "No autorizado" });
  }

  // Solo permitir método POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Configurar formidable para procesar la subida de archivos
    const form = formidable({
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes("image");
      },
    });

    // Procesar la subida de archivos
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Verificar si se subió un archivo
    if (!files.file || !files.file[0]) {
      return res
        .status(400)
        .json({ message: "No se ha subido ningún archivo" });
    }

    const file = files.file[0];

    // Subir a Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "agromap/profiles",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      // Crear un stream legible desde el archivo
      const fileStream = fs.createReadStream(file.filepath);
      fileStream.pipe(uploadStream);
    });

    const result = await uploadPromise;

    // Limpiar el archivo temporal
    fs.unlinkSync(file.filepath);

    return res.status(200).json({
      url: result.secure_url,
      message: "Imagen subida correctamente",
    });
  } catch (error) {
    console.error("Error al subir archivo:", error);
    return res.status(500).json({
      message: "Error al procesar la subida de archivos",
      error: error.message,
    });
  }
}
