import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    // Verificar la conexión a la base de datos
    await prisma.$connect();

    const baseProducts = await prisma.productBase.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
        image: true,
        nutrition: true,
      },
    });

    // Cerrar la conexión
    await prisma.$disconnect();

    if (!baseProducts || baseProducts.length === 0) {
      return res.status(200).json({
        baseProducts: [],
        message: "No se encontraron productos base",
      });
    }

    return res.status(200).json({ baseProducts });
  } catch (error) {
    console.error("Error al obtener productos base:", error);

    // Cerrar la conexión en caso de error
    await prisma.$disconnect().catch(console.error);

    return res.status(500).json({
      message: "Error al obtener productos base",
      error: error.message,
      code: error.code,
      meta: error.meta,
    });
  }
}
