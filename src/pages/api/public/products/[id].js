import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        description: true,
        quantity: true,
        isAvailable: true,
        sasProgram: true,
        createdAt: true,
        market: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Error al obtener detalle del producto:", error);
    return res.status(500).json({ message: "Error al obtener el producto" });
  }
}
