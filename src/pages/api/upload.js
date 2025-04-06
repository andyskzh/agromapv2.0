import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
      uploadDir: path.join(process.cwd(), "public/uploads"),
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: ({ mimetype }) => {
        return mimetype && mimetype.includes("image");
      },
    });

    // Crear el directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

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

    // Generar un nombre único para el archivo
    const fileExt = path.extname(file.originalFilename);
    const fileName = `${uuidv4()}${fileExt}`;
    const newPath = path.join(uploadDir, fileName);

    // Renombrar el archivo
    fs.renameSync(file.filepath, newPath);

    // Devolver la URL del archivo
    const fileUrl = `/uploads/${fileName}`;

    return res.status(200).json({
      url: fileUrl,
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
