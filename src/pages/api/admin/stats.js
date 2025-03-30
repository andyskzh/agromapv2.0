import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  try {
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const markets = await prisma.market.count();

    return res.status(200).json({ users, products, markets });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return res.status(500).json({ message: "Error al obtener estadísticas" });
  }
}
