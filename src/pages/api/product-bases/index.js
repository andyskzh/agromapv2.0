import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const bases = await prisma.productBase.findMany({
      orderBy: { name: "asc" },
    });

    return res.status(200).json(bases);
  } catch (error) {
    console.error("Error al obtener productos base:", error);
    return res.status(500).json({ message: "Error al obtener productos base" });
  }
}
