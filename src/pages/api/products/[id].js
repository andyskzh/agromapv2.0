import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "MARKET_MANAGER") {
    return res.status(401).json({ message: "No autorizado" });
  }

  const { id } = req.query;

  try {
    // Obtener el mercado del gestor
    const market = await prisma.market.findFirst({
      where: { managerId: session.user.id },
    });

    if (!market) {
      return res
        .status(404)
        .json({ message: "No tienes un mercado registrado" });
    }

    if (req.method === "GET") {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          market: true,
          baseProduct: true,
        },
      });

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Verificar que el producto pertenece al mercado del gestor
      if (product.marketId !== market.id) {
        return res
          .status(403)
          .json({ message: "No autorizado para ver este producto" });
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
      } = req.body;

      if (!name || !quantity) {
        return res
          .status(400)
          .json({ message: "Nombre y cantidad son obligatorios" });
      }

      const updated = await prisma.product.updateMany({
        where: { id, marketId: market.id },
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
          image,
        },
      });

      if (updated.count === 0) {
        return res
          .status(404)
          .json({ message: "No se pudo actualizar el producto" });
      }

      return res
        .status(200)
        .json({ message: "Producto actualizado correctamente" });
    }

    if (req.method === "DELETE") {
      const deleted = await prisma.product.deleteMany({
        where: { id, marketId: market.id },
      });

      if (deleted.count === 0) {
        return res
          .status(404)
          .json({ message: "Producto no encontrado o no autorizado" });
      }

      return res.status(200).json({ message: "Producto eliminado" });
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error("Error al procesar el producto:", error);
    return res.status(500).json({ message: "Error al procesar el producto" });
  }
}
