import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "MARKET_MANAGER") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  // Configurar formidable
  const form = formidable({
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  // Parsear el formulario
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error al parsear el formulario:", err);
      return res.status(500).json({
        message: "Error al procesar el formulario",
        details: err.message,
      });
    }

    const { name, location, description, legalBeneficiary } = fields;
    const imageFile = files.image?.[0];

    if (!name || !location) {
      return res.status(400).json({
        message: "Nombre y ubicación son obligatorios",
      });
    }

    try {
      // Buscar el mercado del gestor
      const market = await prisma.market.findFirst({
        where: { managerId: session.user.id },
      });

      if (!market) {
        return res.status(404).json({
          message: "No se encontró un mercado para actualizar",
        });
      }

      let imageUrl = market.image; // Mantener la imagen actual por defecto

      // Si hay una nueva imagen, subirla a Cloudinary
      if (imageFile) {
        const result = await cloudinary.uploader.upload(imageFile.filepath, {
          folder: "agromap/mercados",
        });
        imageUrl = result.secure_url;
      }

      // Actualizar el mercado
      const updated = await prisma.market.update({
        where: { id: market.id },
        data: {
          name: name.toString(),
          location: location.toString(),
          description: description?.toString(),
          latitude: parseFloat(fields.latitude.toString()),
          longitude: parseFloat(fields.longitude.toString()),
          image: imageUrl,
          legalBeneficiary: legalBeneficiary?.toString() || null,
        },
      });

      return res.status(200).json({
        message: "Mercado actualizado correctamente",
        market: updated,
      });
    } catch (error) {
      console.error("Error al actualizar el mercado:", error);
      return res.status(500).json({
        message: "Error al actualizar el mercado",
        details: error.message,
      });
    }
  });
}
