import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { id } = req.query;

  try {
    // Obtener el mercado del gestor
    const market = await prisma.market.findFirst({
      where: { managerId: session.user.id },
      select: { id: true },
    });

    if (!market) {
      return res
        .status(404)
        .json({ message: "No se encontró un mercado asociado a tu cuenta" });
    }

    if (req.method === "GET") {
      const product = await prisma.product.findFirst({
        where: {
          id,
          marketId: market.id,
        },
        include: {
          market: true,
          baseProduct: true,
        },
      });

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      return res.status(200).json({ product });
    }

    if (req.method === "PUT") {
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
        images = [],
      } = req.body;

      // Validar campos requeridos
      if (!name || !quantity) {
        return res.status(400).json({
          message:
            "Faltan campos requeridos: nombre y cantidad son obligatorios",
        });
      }

      // Actualizar el producto
      const updatedProduct = await prisma.product.update({
        where: {
          id,
          marketId: market.id,
        },
        data: {
          name,
          description,
          quantity: parseInt(quantity),
          unit,
          price: price ? parseFloat(price) : null,
          priceType,
          category,
          isAvailable,
          sasProgram,
          baseProductId: baseProductId || null,
          image: image || null,
          images: images || [],
        },
      });

      return res.status(200).json({ product: updatedProduct });
    }

    if (req.method === "DELETE") {
      // Obtener el producto para verificar permisos
      const product = await prisma.product.findFirst({
        where: {
          id,
          marketId: market.id,
        },
      });

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Eliminar el producto
      await prisma.product.delete({
        where: { id },
      });

      return res
        .status(200)
        .json({ message: "Producto eliminado correctamente" });
    }

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error("Error al procesar el producto:", error);
    return res.status(500).json({
      message: "Error al procesar el producto",
      error: error.message,
    });
  }
}
