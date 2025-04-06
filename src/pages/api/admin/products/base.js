import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (req.method === "GET") {
    try {
      const baseProducts = await prisma.productBase.findMany({
        orderBy: { name: "asc" },
      });

      return res.status(200).json({ baseProducts });
    } catch (error) {
      console.error("Error al obtener productos base:", error);
      return res
        .status(500)
        .json({ message: "Error al obtener productos base" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, image, category, nutrition } = req.body;

      if (!name || !image || !category) {
        return res.status(400).json({
          message:
            "Faltan campos requeridos: nombre, imagen y categoría son obligatorios",
        });
      }

      const baseProduct = await prisma.productBase.create({
        data: {
          name,
          image,
          category,
          nutrition: nutrition || "",
        },
      });

      return res.status(201).json({ baseProduct });
    } catch (error) {
      console.error("Error al crear producto base:", error);
      return res.status(500).json({ message: "Error al crear producto base" });
    }
  }

  return res.status(405).json({ message: "Método no permitido" });
}
