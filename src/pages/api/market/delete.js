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
    });

    if (!market) {
      return res.status(404).json({
        message: "No se encontró un mercado para eliminar",
      });
    }

    // Eliminar el mercado
    await prisma.market.delete({
      where: { id: market.id },
    });

    return res.status(200).json({
      message: "Mercado eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar el mercado:", error);
    return res.status(500).json({
      message: "Error al eliminar el mercado",
      details: error.message,
    });
  }
}
