import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { IncomingForm } from "formidable"; // ✅ Import corregido
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "MARKET_MANAGER") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const form = new IncomingForm({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error al parsear FormData:", err);
      return res
        .status(500)
        .json({ message: "Error al procesar datos del formulario" });
    }

    const { name, description, quantity, isAvailable, sasProgram } = fields;
    const images = Array.isArray(files.images) ? files.images : [files.images];

    if (!name || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Nombre y cantidad válida son obligatorios" });
    }

    try {
      const market = await prisma.market.findFirst({
        where: { managerId: session.user.id },
      });

      if (!market) {
        return res
          .status(404)
          .json({ message: "No se encontró el mercado del gestor" });
      }

      // Subir imágenes a Cloudinary
      const uploadedImages = await Promise.all(
        images.map(async (imageFile) => {
          const result = await cloudinary.uploader.upload(imageFile.filepath, {
            folder: "agromap/productos",
          });
          return result.secure_url;
        })
      );

      const product = await prisma.product.create({
        data: {
          name: name.toString(),
          description: description?.toString() || null,
          quantity: parseInt(quantity),
          isAvailable: isAvailable === "true",
          sasProgram: sasProgram === "true",
          image: uploadedImages[0], // imagen principal
          marketId: market.id,
        },
      });

      // 🚨 Aquí podrías guardar más URLs en otra tabla si deseas más adelante

      return res.status(201).json({ message: "Producto creado", product });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error al crear el producto" });
    }
  });
}
