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
    const market = await prisma.market.findFirst({
      where: { managerId: session.user.id },
    });

    return res.status(200).json({ market });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al obtener el mercado" });
  }
}
