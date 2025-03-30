import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "MARKET_MANAGER") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { name, location, description } = req.body;

  if (!name || !location) {
    return res
      .status(400)
      .json({ message: "Nombre y ubicación son obligatorios" });
  }

  try {
    const updated = await prisma.market.updateMany({
      where: { managerId: session.user.id },
      data: {
        name,
        location,
        description,
      },
    });

    if (updated.count === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró un mercado para actualizar" });
    }

    return res
      .status(200)
      .json({ message: "Mercado actualizado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al actualizar el mercado" });
  }
}
