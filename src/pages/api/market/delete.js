import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "MARKET_MANAGER") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Buscar el mercado del gestor
    const market = await prisma.market.findFirst({
      where: { managerId: session.user.id },
      include: {
        products: {
          include: {
            comments: true,
          },
        },
      },
    });

    if (!market) {
      return res.status(404).json({
        message: "No se encontró un mercado para eliminar",
      });
    }

    // Eliminar todos los comentarios asociados a los productos del mercado
    for (const product of market.products) {
      await prisma.comment.deleteMany({
        where: { productId: product.id },
      });
    }

    // Eliminar todos los productos del mercado
    await prisma.product.deleteMany({
      where: { marketId: market.id },
    });

    // Eliminar los horarios del mercado
    await prisma.marketSchedule.deleteMany({
      where: { marketId: market.id },
    });

    // Finalmente, eliminar el mercado
    await prisma.market.delete({
      where: { id: market.id },
    });

    return res.status(200).json({
      message: "Mercado eliminado correctamente",
      deletedItems: {
        products: market.products.length,
        comments: market.products.reduce(
          (acc, product) => acc + product.comments.length,
          0
        ),
      },
    });
  } catch (error) {
    console.error("Error al eliminar el mercado:", error);
    return res.status(500).json({
      message: "Error al eliminar el mercado",
      details: error.message,
    });
  }
}
