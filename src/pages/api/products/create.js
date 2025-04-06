import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

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

  try {
    const {
      name,
      description,
      quantity,
      unit,
      price,
      priceType,
      category,
      isAvailable,
      sasProgram,
      baseProductId,
      image,
    } = req.body;

    if (!name || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ message: "Nombre y cantidad válida son obligatorios" });
    }

    // Obtener el mercado del gestor
    const market = await prisma.market.findFirst({
      where: { managerId: session.user.id },
    });

    if (!market) {
      return res
        .status(404)
        .json({ message: "No se encontró el mercado del gestor" });
    }

    let imageUrl = null;

    // Si hay una imagen en base64, subirla a Cloudinary
    if (image && image.startsWith("data:image")) {
      const result = await cloudinary.uploader.upload(image, {
        folder: "agromap/productos",
      });
      imageUrl = result.secure_url;
    }

    // Crear el producto
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        quantity: parseInt(quantity),
        unit: unit || "kg",
        price: price ? parseFloat(price) : null,
        priceType: priceType || "unidad",
        category: category || "OTRO",
        isAvailable: isAvailable === true,
        sasProgram: sasProgram === true,
        image: imageUrl,
        marketId: market.id,
        baseProductId: baseProductId || null,
      },
    });

    return res.status(201).json({ message: "Producto creado", product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear el producto" });
  }
}
