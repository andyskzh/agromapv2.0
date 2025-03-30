import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        image: true,
        isAvailable: true,
        sasProgram: true,
        category: true, // 👈 ESTE FALTABA
      },
    });

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Error al obtener productos públicos:", error);
    return res.status(500).json({ message: "Error al obtener los productos" });
  }
}
