import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      const market = await prisma.market.findUnique({
        where: { id },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      if (!market) {
        return res.status(404).json({ message: "Mercado no encontrado" });
      }

      return res.status(200).json({ market });
    } catch (error) {
      console.error("Error al obtener mercado:", error);
      return res.status(500).json({ message: "Error al obtener mercado" });
    }
  }

  if (req.method === "PUT") {
    try {
      const { name, location, description, managerId, latitude, longitude } =
        req.body;

      if (!name || !location || !latitude || !longitude) {
        return res
          .status(400)
          .json({ message: "Nombre, ubicación y coordenadas son requeridos" });
      }

      const market = await prisma.market.update({
        where: { id },
        data: {
          name,
          location,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          managerId: managerId || undefined,
        },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      });

      return res.status(200).json({ market });
    } catch (error) {
      console.error("Error al actualizar mercado:", error);
      return res.status(500).json({ message: "Error al actualizar mercado" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await prisma.market.delete({
        where: { id },
      });
      return res.status(200).json({ message: "Mercado eliminado" });
    } catch (error) {
      console.error("Error al eliminar mercado:", error);
      return res.status(500).json({ message: "Error al eliminar mercado" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
