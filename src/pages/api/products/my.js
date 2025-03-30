import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "MARKET_MANAGER") {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    // Obtener el mercado del gestor
    const market = await prisma.market.findFirst({
      where: { managerId: session.user.id },
    });

    if (!market) {
      return res
        .status(404)
        .json({ message: "No se encontró un mercado asociado" });
    }

    const products = await prisma.product.findMany({
      where: { marketId: market.id },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener los productos" });
  }
}
