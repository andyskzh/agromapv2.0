import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      const markets = await prisma.market.findMany({
        orderBy: { name: "asc" },
        include: {
          manager: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          products: {
            select: {
              id: true,
            },
          },
        },
      });

      res.status(200).json({ markets });
    } catch (error) {
      console.error("Error al obtener mercados:", error);
      res.status(500).json({ message: "Error al obtener mercados" });
    }
  } else if (req.method === "POST") {
    try {
      const { name, location, description, managerId, latitude, longitude } =
        req.body;

      if (!name || !location || !latitude || !longitude) {
        return res.status(400).json({
          message: "El nombre, ubicación y coordenadas son campos requeridos",
        });
      }

      // Si se proporciona un managerId, verificar que el usuario existe y es un MARKET_MANAGER
      if (managerId) {
        const manager = await prisma.user.findUnique({
          where: { id: managerId },
        });

        if (!manager || manager.role !== "MARKET_MANAGER") {
          return res.status(400).json({
            message: "El gestor seleccionado no es válido",
          });
        }
      }

      const market = await prisma.market.create({
        data: {
          name,
          location,
          description,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          managerId: managerId || null,
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

      res.status(201).json({ market });
    } catch (error) {
      console.error("Error al crear mercado:", error);
      res.status(500).json({ message: "Error al crear mercado" });
    }
  } else {
    res.status(405).json({ message: "Método no permitido" });
  }
}
