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
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        market: {
          select: { name: true },
        },
      },
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({ message: "Error al obtener productos" });
  }
}
