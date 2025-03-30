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
      const product = await prisma.product.findFirst({
        where: { id, marketId: market.id },
      });

      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      return res.status(200).json({ product });
    }

    if (req.method === "PUT") {
      const { name, description, quantity, image } = req.body;

      if (!name || !quantity || quantity < 1) {
        return res
          .status(400)
          .json({ message: "Nombre y cantidad válida son obligatorios" });
      }

      const updated = await prisma.product.updateMany({
        where: { id, marketId: market.id },
        data: {
          name,
          description,
          quantity,
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

    return res.status(405).json({ message: "Método no permitido" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
}
